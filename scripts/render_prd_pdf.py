#!/usr/bin/env python3
"""Render the canonical Markdown PRD into a branded, review-ready PDF."""

from __future__ import annotations

import argparse
import html
import re
import textwrap
from pathlib import Path

from PIL import Image as PILImage
from PIL import ImageDraw, ImageFont
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    BaseDocTemplate,
    CondPageBreak,
    Flowable,
    Frame,
    HRFlowable,
    Image,
    KeepTogether,
    ListFlowable,
    ListItem,
    LongTable,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Preformatted,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MARKDOWN = ROOT / "财经推演室_PRD_V2.0.md"
DEFAULT_OUTPUT = ROOT / "output" / "pdf" / "财经推演室_PRD_V2.0.pdf"
AGENT_IMAGE = ROOT / "形象参考" / "Weixin Image_20260722153424_220_2954.png"
ASSET_DIR = ROOT / "assets" / "prd-v2"

# Populated from the selected Markdown in ``render`` so the same renderer can
# produce the canonical V2.0 PDF and later review candidates without stale
# cover/header metadata.
DOC_VERSION = "V2.0"
DOC_DATE = "2026-07-22"
DOC_REVIEW_LABEL = "唯一权威产品口径"
DOC_FOOTER_LABEL = "团队实施基线"

PAPER = colors.HexColor("#F5EFDF")
PAPER_LIGHT = colors.HexColor("#FFFDF7")
INK = colors.HexColor("#181815")
INK_2 = colors.HexColor("#2B2A25")
MUTED = colors.HexColor("#777269")
GOLD = colors.HexColor("#D3A32B")
YELLOW = colors.HexColor("#FFD541")
LINE = colors.HexColor("#D9CFBB")
GREEN = colors.HexColor("#4F9274")
RED = colors.HexColor("#B96052")
BLUE = colors.HexColor("#527C99")

PAGE_W, PAGE_H = A4
LEFT = 17 * mm
RIGHT = 17 * mm
TOP = 18 * mm
BOTTOM = 16 * mm
CONTENT_W = PAGE_W - LEFT - RIGHT

FONT_REG = "OPPO-Regular"
FONT_MED = "OPPO-Medium"
FONT_BOLD = "OPPO-Bold"


def register_fonts() -> None:
    candidates = {
        FONT_REG: [
            Path("/home/samsong/.local/share/fonts/OPPOSans R.ttf"),
            Path("/usr/share/fonts/truetype/droid/DroidSansFallbackFull.ttf"),
        ],
        FONT_MED: [
            Path("/home/samsong/.local/share/fonts/OPPOSans M.ttf"),
            Path("/usr/share/fonts/truetype/droid/DroidSansFallbackFull.ttf"),
        ],
        FONT_BOLD: [
            Path("/home/samsong/.local/share/fonts/OPPOSans B.ttf"),
            Path("/usr/share/fonts/truetype/droid/DroidSansFallbackFull.ttf"),
        ],
    }
    for name, paths in candidates.items():
        for path in paths:
            if path.exists():
                pdfmetrics.registerFont(TTFont(name, str(path)))
                break
        else:
            raise FileNotFoundError(f"No usable font found for {name}")


def pil_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    path = Path(
        "/home/samsong/.local/share/fonts/OPPOSans B.ttf"
        if bold
        else "/home/samsong/.local/share/fonts/OPPOSans R.ttf"
    )
    fallback = Path("/usr/share/fonts/truetype/droid/DroidSansFallbackFull.ttf")
    return ImageFont.truetype(str(path if path.exists() else fallback), size)


def draw_wrapped(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    font: ImageFont.FreeTypeFont,
    fill: str,
    width_chars: int,
    spacing: int = 8,
) -> None:
    lines: list[str] = []
    for paragraph in text.split("\n"):
        lines.extend(textwrap.wrap(paragraph, width=width_chars) or [""])
    draw.multiline_text(xy, "\n".join(lines), font=font, fill=fill, spacing=spacing)


def make_current_state_comparison() -> Path:
    output = ASSET_DIR / "11-current-state-comparison.png"
    demo_path = ASSET_DIR / "09-current-demo.png"
    base_path = ASSET_DIR / "10-current-simulator-base.png"
    if not demo_path.exists() or not base_path.exists():
        return output

    canvas_img = PILImage.new("RGB", (1600, 1000), "#F5EFDF")
    draw = ImageDraw.Draw(canvas_img)
    draw.ellipse((1240, -260, 1780, 280), outline="#E2D5B6", width=3)
    draw.ellipse((1300, -200, 1720, 220), outline="#EEE5D2", width=65)

    label_font = pil_font(24, True)
    title_font = pil_font(52, True)
    sub_font = pil_font(23)
    card_title = pil_font(28, True)
    body_font = pil_font(19)
    small_font = pil_font(17)

    draw.text((70, 54), "CURRENT STATE · 已确认现状", font=label_font, fill="#9A7521")
    draw.text((70, 105), "两个可用原型，一套仍需统一的产品", font=title_font, fill="#181815")
    draw.text((72, 181), "财经 Demo 提供领域交互；仿真基座提供视频壳与测试能力。V2.0 选择性组合，而非整库照搬。", font=sub_font, fill="#6F6B62")

    def place_screen(path: Path, box: tuple[int, int, int, int]) -> None:
        img = PILImage.open(path).convert("RGB")
        x1, y1, x2, y2 = box
        max_w, max_h = x2 - x1, y2 - y1
        ratio = min(max_w / img.width, max_h / img.height)
        size = (int(img.width * ratio), int(img.height * ratio))
        img = img.resize(size, PILImage.Resampling.LANCZOS)
        x = x1 + (max_w - size[0]) // 2
        y = y1 + (max_h - size[1]) // 2
        draw.rounded_rectangle((x - 12, y - 12, x + size[0] + 12, y + size[1] + 12), radius=28, fill="#18191C")
        canvas_img.paste(img, (x, y))

    draw.rounded_rectangle((70, 255, 705, 918), radius=26, fill="#FFF9ED", outline="#D8CCB3", width=2)
    draw.rounded_rectangle((895, 255, 1530, 918), radius=26, fill="#FFF9ED", outline="#D8CCB3", width=2)
    draw.text((100, 285), "当前财经 Demo", font=card_title, fill="#181815")
    draw.text((925, 285), "抖音仿真基座", font=card_title, fill="#181815")
    place_screen(demo_path, (105, 335, 395, 820))
    place_screen(base_path, (930, 335, 1220, 820))
    draw_wrapped(draw, (420, 360), "可取：领域页面与视觉语义\n需改：自由跳转、即时沙盘、68% 报告\n缺失：后端、规则、模型与持久化", body_font, "#57534B", 16, 10)
    draw_wrapped(draw, (1245, 360), "可取：视频流、播放、PWA、Media Range、多视口测试\n需改：Extension 尚未接入\n排除：约 5.8GB 媒体、缓存与依赖", body_font, "#57534B", 16, 10)
    draw.rounded_rectangle((420, 685, 650, 744), radius=14, fill="#25241F")
    draw.text((448, 701), "迁移领域交互", font=small_font, fill="#FFD541")
    draw.rounded_rectangle((1245, 685, 1475, 744), radius=14, fill="#25241F")
    draw.text((1272, 701), "复用基础能力", font=small_font, fill="#FFD541")
    draw.text((757, 515), "+", font=pil_font(64, True), fill="#C39628")
    draw.text((735, 590), "选择性组合", font=small_font, fill="#8D6C1F")
    draw.text((70, 950), "图 0 · 现状取证，不代表目标产品已经实现", font=small_font, fill="#817C72")
    output.parent.mkdir(parents=True, exist_ok=True)
    canvas_img.save(output, quality=95)
    return output


class SectionRule(Flowable):
    def __init__(self, width: float = CONTENT_W):
        super().__init__()
        self.width = width
        self.height = 5

    def draw(self) -> None:
        self.canv.setFillColor(GOLD)
        self.canv.roundRect(0, 1, 38, 3, 1.5, stroke=0, fill=1)
        self.canv.setFillColor(LINE)
        self.canv.rect(45, 2, max(0, self.width - 45), 1, stroke=0, fill=1)


class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states: list[dict] = []

    def showPage(self) -> None:
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self) -> None:
        page_count = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self._draw_footer(page_count)
            super().showPage()
        super().save()

    def _draw_footer(self, page_count: int) -> None:
        page_num = self._pageNumber
        if page_num == 1:
            return
        self.saveState()
        self.setStrokeColor(LINE)
        self.setLineWidth(0.6)
        self.line(LEFT, 12 * mm, PAGE_W - RIGHT, 12 * mm)
        self.setFont(FONT_REG, 7.2)
        self.setFillColor(MUTED)
        self.drawString(LEFT, 7.8 * mm, f"财经推演室 · PRD {DOC_VERSION} · {DOC_FOOTER_LABEL}")
        self.drawRightString(PAGE_W - RIGHT, 7.8 * mm, f"{page_num} / {page_count}")
        self.restoreState()


class PRDDocTemplate(BaseDocTemplate):
    def __init__(self, filename: str):
        super().__init__(
            filename,
            pagesize=A4,
            leftMargin=LEFT,
            rightMargin=RIGHT,
            topMargin=TOP,
            bottomMargin=BOTTOM,
            title=f"财经推演室 PRD {DOC_VERSION}",
            author="财经推演室产品团队",
            subject=f"视频时间轴知识触点与过程学习总结 · {DOC_FOOTER_LABEL}",
        )
        cover_frame = Frame(0, 0, PAGE_W, PAGE_H, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0, id="cover")
        body_frame = Frame(LEFT, BOTTOM, CONTENT_W, PAGE_H - TOP - BOTTOM, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0, id="body")
        self.addPageTemplates(
            [
                PageTemplate(id="Cover", frames=[cover_frame], onPage=draw_cover),
                PageTemplate(id="Body", frames=[body_frame], onPage=draw_body_header),
            ]
        )

    def afterFlowable(self, flowable: Flowable) -> None:
        bookmark = getattr(flowable, "_bookmark_name", None)
        if not bookmark:
            return
        level = getattr(flowable, "_outline_level", 0)
        text = getattr(flowable, "_plain_text", "")
        self.canv.bookmarkPage(bookmark)
        try:
            self.canv.addOutlineEntry(text, bookmark, level=level, closed=level > 0)
        except Exception:
            pass


def draw_cover(canv: canvas.Canvas, doc: BaseDocTemplate) -> None:
    canv.saveState()
    canv.setFillColor(PAPER)
    canv.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    canv.setFillColor(colors.HexColor("#EFE5CE"))
    canv.circle(PAGE_W + 15 * mm, PAGE_H - 20 * mm, 72 * mm, stroke=0, fill=1)
    canv.setStrokeColor(colors.HexColor("#D9BE77"))
    canv.setLineWidth(1)
    canv.circle(PAGE_W + 15 * mm, PAGE_H - 20 * mm, 54 * mm, stroke=1, fill=0)
    canv.setFillColor(INK)
    canv.roundRect(0, 0, PAGE_W, 23 * mm, 0, stroke=0, fill=1)
    canv.setFillColor(GOLD)
    canv.rect(0, 0, 10 * mm, PAGE_H, stroke=0, fill=1)

    canv.setFillColor(colors.HexColor("#97711A"))
    canv.setFont(FONT_BOLD, 9)
    canv.drawString(25 * mm, PAGE_H - 29 * mm, f"PRODUCT REQUIREMENTS DOCUMENT · {DOC_VERSION}")
    canv.setFillColor(INK)
    canv.setFont(FONT_BOLD, 35)
    canv.drawString(25 * mm, PAGE_H - 55 * mm, "财经推演室")
    canv.setFont(FONT_MED, 17)
    canv.drawString(25 * mm, PAGE_H - 68 * mm, "把财经视频，变成一场亲手推演")

    canv.setFillColor(MUTED)
    canv.setFont(FONT_REG, 10.5)
    lines = [
        "从多模态理解、时间轴触点，到半屏微交互与过程总结。",
        "财包在关键时点出现，视频继续，证据留下。",
    ]
    y = PAGE_H - 84 * mm
    for line in lines:
        canv.drawString(25 * mm, y, line)
        y -= 7 * mm

    canv.setFillColor(INK_2)
    canv.roundRect(25 * mm, 72 * mm, 108 * mm, 34 * mm, 4 * mm, stroke=0, fill=1)
    canv.setFillColor(YELLOW)
    canv.setFont(FONT_BOLD, 9)
    canv.drawString(32 * mm, 96 * mm, DOC_REVIEW_LABEL)
    canv.setFillColor(colors.white)
    canv.setFont(FONT_REG, 8.8)
    canv.drawString(32 * mm, 87 * mm, "参赛 V1 + 生产化演进")
    canv.drawString(32 * mm, 80 * mm, "移动视频流 · 财包知识触点")

    if AGENT_IMAGE.exists():
        canv.setFillColor(YELLOW)
        canv.roundRect(PAGE_W - 68 * mm, 58 * mm, 48 * mm, 48 * mm, 12 * mm, stroke=0, fill=1)
        canv.drawImage(str(AGENT_IMAGE), PAGE_W - 66 * mm, 60 * mm, 44 * mm, 44 * mm, preserveAspectRatio=True, mask="auto")
        canv.setFillColor(INK)
        canv.setFont(FONT_BOLD, 11)
        canv.drawCentredString(PAGE_W - 44 * mm, 51 * mm, "财包｜关键时点提醒你")

    canv.setFillColor(colors.HexColor("#BDB8AE"))
    canv.setFont(FONT_REG, 8)
    canv.drawString(25 * mm, 10 * mm, f"版本 {DOC_VERSION} · {DOC_DATE}")
    canv.drawRightString(PAGE_W - 18 * mm, 10 * mm, DOC_FOOTER_LABEL)
    canv.restoreState()


def draw_body_header(canv: canvas.Canvas, doc: BaseDocTemplate) -> None:
    canv.saveState()
    canv.setFillColor(PAPER_LIGHT)
    canv.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    canv.setFillColor(GOLD)
    canv.rect(0, PAGE_H - 5 * mm, PAGE_W, 5 * mm, stroke=0, fill=1)
    canv.setFont(FONT_BOLD, 7.5)
    canv.setFillColor(colors.HexColor("#8E6A1B"))
    canv.drawString(LEFT, PAGE_H - 13 * mm, f"财经推演室 · PRD {DOC_VERSION}")
    canv.setFont(FONT_REG, 7.5)
    canv.setFillColor(MUTED)
    canv.drawRightString(PAGE_W - RIGHT, PAGE_H - 13 * mm, "事实、决策、约束、接口与测试统一基线")
    canv.restoreState()


def make_styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "body": ParagraphStyle(
            "BodyCN",
            parent=base["BodyText"],
            fontName=FONT_REG,
            fontSize=9.0,
            leading=13.0,
            textColor=INK_2,
            spaceAfter=4.5,
            allowWidows=0,
            allowOrphans=0,
        ),
        "h1": ParagraphStyle(
            "H1CN",
            parent=base["Heading1"],
            fontName=FONT_BOLD,
            fontSize=20,
            leading=25,
            textColor=INK,
            spaceBefore=0,
            spaceAfter=6,
            keepWithNext=True,
        ),
        "h2": ParagraphStyle(
            "H2CN",
            parent=base["Heading2"],
            fontName=FONT_BOLD,
            fontSize=12.8,
            leading=17,
            textColor=INK,
            spaceBefore=7,
            spaceAfter=4,
            keepWithNext=True,
        ),
        "h3": ParagraphStyle(
            "H3CN",
            parent=base["Heading3"],
            fontName=FONT_MED,
            fontSize=10.2,
            leading=14,
            textColor=colors.HexColor("#765A19"),
            spaceBefore=5,
            spaceAfter=3,
            keepWithNext=True,
        ),
        "quote": ParagraphStyle(
            "QuoteCN",
            parent=base["BodyText"],
            fontName=FONT_MED,
            fontSize=8.8,
            leading=13,
            textColor=INK_2,
            backColor=colors.HexColor("#F3E8C9"),
            borderColor=GOLD,
            borderWidth=0.8,
            borderPadding=7,
            leftIndent=4,
            rightIndent=4,
            spaceBefore=5,
            spaceAfter=6,
        ),
        "caption": ParagraphStyle(
            "CaptionCN",
            parent=base["BodyText"],
            fontName=FONT_REG,
            fontSize=7.6,
            leading=10.5,
            alignment=TA_CENTER,
            textColor=MUTED,
            spaceBefore=4,
            spaceAfter=8,
        ),
        "table_head": ParagraphStyle(
            "TableHeadCN",
            parent=base["BodyText"],
            fontName=FONT_BOLD,
            fontSize=6.9,
            leading=9.1,
            textColor=YELLOW,
        ),
        "table_body": ParagraphStyle(
            "TableBodyCN",
            parent=base["BodyText"],
            fontName=FONT_REG,
            fontSize=6.9,
            leading=9.6,
            textColor=INK_2,
        ),
        "code": ParagraphStyle(
            "CodeCN",
            parent=base["Code"],
            fontName=FONT_REG,
            fontSize=6.55,
            leading=9.0,
            # ReportLab's Preformatted flowable does not consistently paint
            # ParagraphStyle backgrounds. Keep code readable even when the
            # background is omitted by using dark text on the page color.
            textColor=INK_2,
            backColor=colors.HexColor("#F3E8C9"),
            borderColor=LINE,
            borderWidth=1,
            borderPadding=8,
            leftIndent=0,
            rightIndent=0,
            spaceBefore=5,
            spaceAfter=8,
        ),
    }


TAG_MARKUP = {
    "[现状事实]": '<font color="#527C99"><b>[现状事实]</b></font>',
    "[产品决策]": '<font color="#8E6A1B"><b>[产品决策]</b></font>',
    "[假设]": '<font color="#4F9274"><b>[假设]</b></font>',
    "[发布阻塞项]": '<font color="#B96052"><b>[发布阻塞项]</b></font>',
}


def inline_markup(text: str) -> str:
    result = html.escape(text, quote=False)
    result = re.sub(r"`([^`]+)`", rf'<font name="{FONT_MED}" color="#7A5C17">\1</font>', result)
    result = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", result)
    result = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<font color="#527C99"><u>\1</u></font>', result)
    for token, markup in TAG_MARKUP.items():
        escaped = html.escape(token, quote=False)
        result = result.replace(escaped, markup)
    return result


def heading(text: str, level: int, styles: dict[str, ParagraphStyle], index: int) -> list[Flowable]:
    style = styles["h1" if level == 1 else "h2" if level == 2 else "h3"]
    p = Paragraph(inline_markup(text), style)
    p._bookmark_name = f"section-{index}"
    p._outline_level = max(0, min(level - 1, 2))
    p._plain_text = text
    items: list[Flowable] = [p]
    if level == 1:
        items.insert(0, CondPageBreak(90 * mm))
        rule = SectionRule()
        rule.keepWithNext = True
        gap = Spacer(1, 4)
        gap.keepWithNext = True
        items.append(rule)
        items.append(gap)
    return items


def callout(text: str, styles: dict[str, ParagraphStyle]) -> Flowable:
    p = Paragraph(inline_markup(text), styles["quote"])
    return p


def table_widths(rows: list[list[str]]) -> list[float]:
    cols = len(rows[0])
    header = rows[0]
    if cols == 2:
        return [0.28 * CONTENT_W, 0.72 * CONTENT_W]
    if cols == 3:
        return [0.19 * CONTENT_W, 0.35 * CONTENT_W, 0.46 * CONTENT_W]
    if cols == 4:
        first = 0.12 if header[0] in {"ID", "方法", "字段", "工具", "维度", "事件", "需求", "code"} else 0.19
        remaining = 1 - first
        return [first * CONTENT_W, 0.25 * CONTENT_W, 0.34 * CONTENT_W, (remaining - 0.59) * CONTENT_W]
    if cols == 5:
        return [0.10 * CONTENT_W, 0.20 * CONTENT_W, 0.24 * CONTENT_W, 0.23 * CONTENT_W, 0.23 * CONTENT_W]
    return [CONTENT_W / cols] * cols


def make_table(rows: list[list[str]], styles: dict[str, ParagraphStyle]) -> LongTable:
    max_cols = max(len(r) for r in rows)
    normalized = [r + [""] * (max_cols - len(r)) for r in rows]
    data: list[list[Paragraph]] = []
    for ri, row in enumerate(normalized):
        style = styles["table_head"] if ri == 0 else styles["table_body"]
        data.append([Paragraph(inline_markup(cell.strip()), style) for cell in row])
    table = LongTable(data, colWidths=table_widths(normalized), repeatRows=1, hAlign="LEFT")
    commands: list[tuple] = [
        ("BACKGROUND", (0, 0), (-1, 0), INK_2),
        ("TEXTCOLOR", (0, 0), (-1, 0), YELLOW),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.45, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]
    for row_index in range(1, len(data)):
        bg = colors.HexColor("#FFFDF7") if row_index % 2 else colors.HexColor("#F7F1E4")
        commands.append(("BACKGROUND", (0, row_index), (-1, row_index), bg))
    table.setStyle(TableStyle(commands))
    table.spaceBefore = 4
    table.spaceAfter = 8
    return table


def make_figure(alt: str, rel_path: str, source_dir: Path, styles: dict[str, ParagraphStyle]) -> Flowable:
    width_match = re.search(r"\|w=(\d+)", alt)
    requested_width = float(width_match.group(1)) if width_match else CONTENT_W
    clean_alt = re.sub(r"\|w=\d+", "", alt).strip()
    image_path = (source_dir / rel_path).resolve()
    if not image_path.exists():
        return callout(f"[发布阻塞项] 图片资源不存在：{rel_path}", styles)
    with PILImage.open(image_path) as pil:
        img_w, img_h = pil.size
    draw_w = min(requested_width, CONTENT_W)
    draw_h = draw_w * img_h / img_w
    max_h = 150 * mm
    if draw_h > max_h:
        draw_h = max_h
        draw_w = draw_h * img_w / img_h
    image_flow = Image(str(image_path), width=draw_w, height=draw_h)
    image_flow.hAlign = "CENTER"
    caption = Paragraph(inline_markup(clean_alt), styles["caption"])
    return KeepTogether([Spacer(1, 3), image_flow, caption])


def flush_paragraph(buffer: list[str], story: list[Flowable], styles: dict[str, ParagraphStyle]) -> None:
    if not buffer:
        return
    parts: list[str] = []
    for line in buffer:
        if line.endswith("  "):
            parts.append(inline_markup(line[:-2]) + "<br/>")
        else:
            parts.append(inline_markup(line.strip()))
    story.append(Paragraph(" ".join(parts), styles["body"]))
    buffer.clear()


def build_story(markdown: str, source_dir: Path, styles: dict[str, ParagraphStyle]) -> list[Flowable]:
    story: list[Flowable] = [NextPageTemplate("Body"), PageBreak()]
    lines = markdown.splitlines()
    try:
        start = lines.index("<!-- BODY -->") + 1
    except ValueError:
        start = 0
    i = start
    paragraph_buffer: list[str] = []
    heading_index = 0

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if stripped == "<!-- PAGEBREAK -->":
            flush_paragraph(paragraph_buffer, story, styles)
            if not isinstance(story[-1], PageBreak):
                story.append(PageBreak())
            i += 1
            continue

        if stripped.startswith("<!--") and stripped.endswith("-->"):
            flush_paragraph(paragraph_buffer, story, styles)
            i += 1
            continue

        if stripped.startswith("```"):
            flush_paragraph(paragraph_buffer, story, styles)
            code_lines: list[str] = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith("```"):
                code_lines.append(lines[i])
                i += 1
            story.append(Preformatted("\n".join(code_lines), styles["code"], maxLineLength=120))
            i += 1
            continue

        image_match = re.fullmatch(r"!\[(.*?)\]\((.*?)\)", stripped)
        if image_match:
            flush_paragraph(paragraph_buffer, story, styles)
            story.append(make_figure(image_match.group(1), image_match.group(2), source_dir, styles))
            i += 1
            continue

        heading_match = re.match(r"^(#{1,3})\s+(.+)$", stripped)
        if heading_match:
            flush_paragraph(paragraph_buffer, story, styles)
            heading_index += 1
            story.extend(heading(heading_match.group(2), len(heading_match.group(1)), styles, heading_index))
            i += 1
            continue

        if stripped.startswith("|") and stripped.endswith("|"):
            flush_paragraph(paragraph_buffer, story, styles)
            raw_rows: list[list[str]] = []
            while i < len(lines):
                row_line = lines[i].strip()
                if not (row_line.startswith("|") and row_line.endswith("|")):
                    break
                cells = [cell.strip() for cell in row_line[1:-1].split("|")]
                if not all(re.fullmatch(r":?-{3,}:?", cell.replace(" ", "")) for cell in cells):
                    raw_rows.append(cells)
                i += 1
            if raw_rows:
                story.append(make_table(raw_rows, styles))
            continue

        if re.match(r"^[-*]\s+", stripped):
            flush_paragraph(paragraph_buffer, story, styles)
            items: list[ListItem] = []
            while i < len(lines) and re.match(r"^\s*[-*]\s+", lines[i]):
                item_text = re.sub(r"^\s*[-*]\s+", "", lines[i]).strip()
                items.append(ListItem(Paragraph(inline_markup(item_text), styles["body"]), leftIndent=10))
                i += 1
            story.append(ListFlowable(items, bulletType="bullet", start="circle", leftIndent=16, bulletFontName=FONT_BOLD, bulletFontSize=6, bulletColor=GOLD, spaceAfter=5))
            continue

        if re.match(r"^\d+\.\s+", stripped):
            flush_paragraph(paragraph_buffer, story, styles)
            items = []
            while i < len(lines) and re.match(r"^\s*\d+\.\s+", lines[i]):
                item_text = re.sub(r"^\s*\d+\.\s+", "", lines[i]).strip()
                items.append(ListItem(Paragraph(inline_markup(item_text), styles["body"]), leftIndent=11))
                i += 1
            story.append(ListFlowable(items, bulletType="1", leftIndent=19, bulletFontName=FONT_MED, bulletFontSize=8, bulletColor=GOLD, spaceAfter=5))
            continue

        if stripped.startswith(">"):
            flush_paragraph(paragraph_buffer, story, styles)
            quote_lines: list[str] = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                quote_lines.append(lines[i].strip()[1:].strip())
                i += 1
            story.append(callout(" ".join(quote_lines), styles))
            continue

        if stripped == "---":
            flush_paragraph(paragraph_buffer, story, styles)
            story.append(HRFlowable(width="100%", thickness=0.8, color=LINE, spaceBefore=8, spaceAfter=8))
            i += 1
            continue

        if not stripped:
            flush_paragraph(paragraph_buffer, story, styles)
            i += 1
            continue

        paragraph_buffer.append(line)
        i += 1

    flush_paragraph(paragraph_buffer, story, styles)
    return story


def render(markdown_path: Path, output_path: Path) -> None:
    global DOC_VERSION, DOC_DATE, DOC_REVIEW_LABEL, DOC_FOOTER_LABEL
    register_fonts()
    text = markdown_path.read_text(encoding="utf-8")
    version_match = re.search(r"PRD[_ ](V\d+\.\d+)", markdown_path.name, re.IGNORECASE)
    if not version_match:
        version_match = re.search(r"PRD\s+(V\d+\.\d+)", text[:1000], re.IGNORECASE)
    if version_match:
        DOC_VERSION = version_match.group(1).upper()
    date_match = re.search(r"(?:日期|更新日期)：\s*(\d{4}-\d{2}-\d{2})", text[:1500])
    if date_match:
        DOC_DATE = date_match.group(1)
    is_review_candidate = bool(re.search(r"状态：[^\n]*待.*评审", text[:1500]))
    DOC_REVIEW_LABEL = "待评审产品口径" if is_review_candidate else "唯一权威产品口径"
    DOC_FOOTER_LABEL = "联合评审候选" if is_review_candidate else "团队实施基线"
    styles = make_styles()
    story = build_story(text, markdown_path.parent, styles)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    doc = PRDDocTemplate(str(output_path))
    doc.build(story, canvasmaker=NumberedCanvas)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--markdown", type=Path, default=DEFAULT_MARKDOWN)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()
    render(args.markdown.resolve(), args.output.resolve())
    print(args.output.resolve())


if __name__ == "__main__":
    main()
