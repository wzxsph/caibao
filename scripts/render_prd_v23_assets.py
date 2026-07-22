#!/usr/bin/env python3
"""Render code-native comparison and architecture figures for PRD V2.3."""

from __future__ import annotations

from pathlib import Path
from typing import Iterable

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "prd-v2.3"
FONT_REG = Path("/home/samsong/.local/share/fonts/OPPOSans R.ttf")
FONT_BOLD = Path("/home/samsong/.local/share/fonts/OPPOSans B.ttf")
FONT_FALLBACK = Path("/usr/share/fonts/truetype/droid/DroidSansFallbackFull.ttf")

PAPER = "#F5EFDF"
PAPER_LIGHT = "#FFF9ED"
INK = "#181815"
MUTED = "#716C63"
GOLD = "#D3A32B"
YELLOW = "#FFD541"
LINE = "#D9CFBB"
GREEN = "#58A781"
RED = "#C76C5D"
BLUE = "#65A3C0"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    path = FONT_BOLD if bold else FONT_REG
    if not path.exists():
        path = FONT_FALLBACK
    return ImageFont.truetype(str(path), size)


def rounded(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], *, fill: str, outline: str | None = None, radius: int = 24, width: int = 2) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def lines(draw: ImageDraw.ImageDraw, x: int, y: int, values: Iterable[str], *, fill: str = MUTED, size: int = 22, gap: int = 12, bullet: bool = False) -> int:
    f = font(size)
    current = y
    for value in values:
        prefix = "• " if bullet else ""
        draw.text((x, current), prefix + value, font=f, fill=fill)
        current += size + gap
    return current


def title_block(draw: ImageDraw.ImageDraw, eyebrow: str, title: str, subtitle: str) -> None:
    draw.text((72, 52), eyebrow, font=font(22, True), fill="#8E6A1B")
    draw.text((72, 95), title, font=font(48, True), fill=INK)
    draw.text((74, 164), subtitle, font=font(22), fill=MUTED)


def paste_phone(canvas: Image.Image, path: Path, box: tuple[int, int, int, int]) -> None:
    image = Image.open(path).convert("RGB")
    x1, y1, x2, y2 = box
    scale = min((x2 - x1) / image.width, (y2 - y1) / image.height)
    resized = image.resize((int(image.width * scale), int(image.height * scale)), Image.Resampling.LANCZOS)
    x = x1 + (x2 - x1 - resized.width) // 2
    y = y1 + (y2 - y1 - resized.height) // 2
    canvas.paste(resized, (x, y))


def render_comparison() -> None:
    canvas = Image.new("RGB", (1600, 1000), PAPER)
    draw = ImageDraw.Draw(canvas)
    title_block(
        draw,
        "AS-IS EVIDENCE · 两套可运行原型",
        "PM 原型补齐内容叙事，集成仓守住播放红线",
        "V2.3 不是二选一：复用 PM 的真实内容包与学习结构，落到 refer/douyin 的不停播半屏容器。",
    )

    cards = [
        (55, 238, 778, 930, "当前集成仓 · GitHub Pages", OUT / "current-integrated-demo.png"),
        (822, 238, 1545, 930, "PM moneybaby · 线上 V0.8", OUT / "moneybaby-online-home.png"),
    ]
    for x1, y1, x2, y2, label, image_path in cards:
        rounded(draw, (x1, y1, x2, y2), fill=PAPER_LIGHT, outline=LINE, radius=30)
        draw.text((x1 + 30, y1 + 24), label, font=font(27, True), fill=INK)
        paste_phone(canvas, image_path, (x1 + 28, y1 + 76, x1 + 358, y2 - 34))

    lines(draw, 430, 346, ["可取", "• Vue/Vite/Express 集成基座", "• 视频交互继续播放", "• 半屏上限 48vh、无蒙层", "• 六类渲染器与完整 E2E"], fill=INK, size=19, gap=15)
    lines(draw, 430, 575, ["当前缺口", "• 工程占位媒体仍是黑屏风险", "• 视频作者元数据串用了李子柒", "• 仅 3 类触点进入运行 Demo", "• 总结仍是基础学习足迹"], fill=RED, size=19, gap=15)

    lines(draw, 1190, 346, ["可取", "• 4:16 真实视频测试资产", "• 版本化内容包与 6 个节点", "• 证据回看、复述与报告叙事", "• 本地刷新恢复"], fill=INK, size=19, gap=15)
    lines(draw, 1190, 575, ["不得移植", "• 进入交互即暂停视频", "• 全屏暗幕、88%—94% 底板", "• 财包占用作者头像位", "• 二选一与静态能力印章"], fill=RED, size=19, gap=15)

    draw.text((72, 952), "图 1 · 2026-07-22 实测证据；线上原型不是目标 UI，目标裁决见图 2。", font=font(17), fill=MUTED)
    canvas.save(OUT / "01-prototype-comparison.png", quality=95)


def phone_frame(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int]) -> None:
    rounded(draw, box, fill="#101116", outline="#34353A", radius=42, width=4)
    x1, y1, x2, _ = box
    rounded(draw, (x1 + 115, y1 + 15, x2 - 115, y1 + 37), fill="#050507", radius=12)


def render_product_shape() -> None:
    canvas = Image.new("RGB", (1600, 1000), PAPER)
    draw = ImageDraw.Draw(canvas)
    title_block(
        draw,
        "TARGET STATE · V2.3 产品形态",
        "观看中只做一个小动作，复杂推演留到片尾",
        "财包是时间轴上的陪练者：邀请轻、容器小、视频不停、结论有证据。",
    )
    caibao_path = ROOT / "形象参考" / "Weixin Image_20260722153424_220_2954.png"
    caibao = Image.open(caibao_path).convert("RGBA") if caibao_path.exists() else None

    phone_boxes = [(80, 245, 470, 900), (605, 245, 995, 900), (1130, 245, 1520, 900)]
    captions = ["1 · 轻邀请", "2 · 不停播半屏微交互", "3 · 片尾深挖与证据报告"]
    for box, caption in zip(phone_boxes, captions):
        phone_frame(draw, box)
        draw.text((box[0] + 30, box[1] + 58), caption, font=font(22, True), fill=YELLOW)

    # State 1: video with a compact invitation.
    x1, y1, x2, y2 = phone_boxes[0]
    draw.rectangle((x1 + 24, y1 + 105, x2 - 24, y2 - 24), fill="#10202A")
    draw.text((x1 + 44, y1 + 150), "视频持续播放", font=font(33, True), fill="white")
    draw.text((x1 + 44, y1 + 202), "字幕、作者和声音保持原语境", font=font(18), fill="#C7D4D9")
    rounded(draw, (x1 + 38, y2 - 185, x2 - 38, y2 - 70), fill="#231F18", outline=GOLD, radius=20)
    if caibao:
        avatar = caibao.copy()
        avatar.thumbnail((72, 72), Image.Resampling.LANCZOS)
        canvas.paste(avatar, (x1 + 51, y2 - 164), avatar)
    draw.text((x1 + 135, y2 - 164), "财包｜先猜一小步", font=font(21, True), fill="white")
    draw.text((x1 + 135, y2 - 128), "4—6 秒可答，也可忽略", font=font(17), fill="#D2C6A8")
    draw.text((x2 - 78, y2 - 130), "›", font=font(34, True), fill=YELLOW)

    # State 2: half sheet, no mask, video visible and playing.
    x1, y1, x2, y2 = phone_boxes[1]
    draw.rectangle((x1 + 24, y1 + 105, x2 - 24, y2 - 24), fill="#10202A")
    draw.text((x1 + 44, y1 + 148), "视频 + 音频继续", font=font(31, True), fill="white")
    draw.text((x1 + 44, y1 + 198), "无暗幕、不自动暂停、不自动 seek", font=font(17), fill="#B6D5D7")
    sheet_top = y1 + int((y2 - y1) * 0.52)
    rounded(draw, (x1 + 24, sheet_top, x2 - 24, y2 - 24), fill="#17181D", outline="#3C3D43", radius=28)
    draw.text((x1 + 48, sheet_top + 28), "财包 · 条件拨片", font=font(21, True), fill=YELLOW)
    draw.text((x1 + 48, sheet_top + 70), "若增长转弱，哪条路径更强？", font=font(21, True), fill="white")
    rounded(draw, (x1 + 48, sheet_top + 122, x2 - 48, sheet_top + 178), fill="#2A2B31", radius=14)
    draw.text((x1 + 67, sheet_top + 138), "支撑路径 / 调整条件 / 压制路径", font=font(16), fill="#D7D4C9")
    rounded(draw, (x1 + 48, sheet_top + 204, x2 - 48, sheet_top + 264), fill=YELLOW, radius=16)
    draw.text((x1 + 118, sheet_top + 222), "记入学习轨迹", font=font(20, True), fill=INK)
    draw.text((x1 + 48, y2 - 50), "容器硬上限 48vh", font=font(16), fill=GREEN)

    # State 3: post-video deep dive.
    x1, y1, x2, y2 = phone_boxes[2]
    draw.rectangle((x1 + 24, y1 + 105, x2 - 24, y2 - 24), fill="#17181D")
    draw.text((x1 + 46, y1 + 142), "本期理解证据", font=font(30, True), fill="white")
    draw.text((x1 + 46, y1 + 190), "不是成绩单，也不显示总分", font=font(17), fill="#D0C7B5")
    for idx, (label, color) in enumerate([("已观察：能区分相关与因果", GREEN), ("待补：相对利差的条件", GOLD), ("回看：02:04—02:48", BLUE)]):
        top = y1 + 245 + idx * 92
        rounded(draw, (x1 + 42, top, x2 - 42, top + 66), fill="#24252B", outline=color, radius=16)
        draw.text((x1 + 60, top + 20), label, font=font(17, idx == 0), fill="white")
    rounded(draw, (x1 + 42, y1 + 550, x2 - 42, y1 + 610), fill=YELLOW, radius=16)
    draw.text((x1 + 115, y1 + 568), "继续条件沙盘", font=font(19, True), fill=INK)

    draw.text((72, 952), "图 2 · V2.3 唯一目标形态：自动邀请最多 4 次；六类能力可按需进入，复述与完整沙盘不挤进观看中。", font=font(17), fill=MUTED)
    canvas.save(OUT / "02-v23-product-shape.png", quality=95)


def pipeline_box(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], title: str, body: str, fill: str = PAPER_LIGHT, title_color: str = INK) -> None:
    rounded(draw, box, fill=fill, outline=LINE, radius=20)
    draw.text((box[0] + 20, box[1] + 17), title, font=font(21, True), fill=title_color)
    draw.multiline_text((box[0] + 20, box[1] + 55), body, font=font(16), fill=MUTED if fill == PAPER_LIGHT else "#E7E1D3", spacing=7)


def arrow(draw: ImageDraw.ImageDraw, start: tuple[int, int], end: tuple[int, int], color: str = GOLD) -> None:
    draw.line((*start, *end), fill=color, width=5)
    ex, ey = end
    draw.polygon([(ex, ey), (ex - 13, ey - 8), (ex - 13, ey + 8)], fill=color)


def render_architecture() -> None:
    canvas = Image.new("RGB", (1600, 1000), PAPER)
    draw = ImageDraw.Draw(canvas)
    title_block(
        draw,
        "REFERENCE ARCHITECTURE · 生成与运行分离",
        "模型生成候选，人审发布；客户端只运行审核计划",
        "现有 refer/douyin 继续作为实现基座，moneybaby 内容包通过适配器进入审核流程，不复制 React 页面。",
    )

    draw.text((72, 225), "A · 内容生产流（已实现骨架，真实 Provider 与发布门禁待验）", font=font(24, True), fill="#8E6A1B")
    top_boxes = [
        ((72, 275, 315, 425), "授权媒体", "文件 / OAuth\n来源、授权、指纹"),
        ((340, 275, 585, 425), "ASR + OCR", "逐句字幕、关键帧\n时间戳与置信度"),
        ((610, 275, 855, 425), "语义时间轴", "概念、背景、因果\n条件、反例、证据"),
        ((880, 275, 1125, 425), "Planner + Author", "确定性间隔/预算\n有界文案与方向锁"),
        ((1150, 275, 1528, 425), "Review / Publish", "CoverageReport 到人审\nApprovedExperience 不可变版本"),
    ]
    for box, title, body in top_boxes:
        pipeline_box(draw, box, title, body, fill=INK if title in {"授权媒体", "Review / Publish"} else PAPER_LIGHT, title_color=YELLOW if title in {"授权媒体", "Review / Publish"} else INK)
    for left, right in zip(top_boxes, top_boxes[1:]):
        arrow(draw, (left[0][2] + 4, 350), (right[0][0] - 8, 350))

    rounded(draw, (72, 458, 1528, 514), fill="#2A2822", radius=16)
    draw.text((94, 474), "发布门禁：授权 + 证据 + 人审 + 间隔 + 可渲染 + 财经安全全部通过；draft 不得冒充已验证内容", font=font(19, True), fill=YELLOW)

    draw.text((72, 558), "B · 用户运行流（Vue/Vite + Express TypeScript）", font=font(24, True), fill="#8E6A1B")
    bottom_boxes = [
        ((72, 610, 315, 790), "视频播放器", "真实媒体与作者元数据\n字幕、进度、Media Range"),
        ((340, 610, 585, 790), "CueOrchestrator", "时间窗、频控、幂等\n快进与跳过策略"),
        ((610, 610, 855, 790), "半屏模板", "6 类轻交互\n≤48vh、视频不停"),
        ((880, 610, 1125, 790), "Session + Events", "localStorage 镜像\n服务端恢复、证据链"),
        ((1150, 610, 1528, 790), "深挖 + 报告", "规则沙盘、受限复述评价\n确定性证据报告"),
    ]
    for box, title, body in bottom_boxes:
        pipeline_box(draw, box, title, body, fill=INK if title in {"视频播放器", "深挖 + 报告"} else PAPER_LIGHT, title_color=YELLOW if title in {"视频播放器", "深挖 + 报告"} else INK)
    for left, right in zip(bottom_boxes, bottom_boxes[1:]):
        arrow(draw, (left[0][2] + 4, 700), (right[0][0] - 8, 700))

    rounded(draw, (72, 830, 760, 907), fill="#E8F3EC", outline="#A8CDB9", radius=16)
    draw.text((94, 849), "确定性职责", font=font(19, True), fill="#35684D")
    draw.text((218, 849), "方向、频控、门禁、报告证据与模型故障兜底", font=font(18), fill="#35684D")
    rounded(draw, (790, 830, 1528, 907), fill="#F7E5E0", outline="#D9A69D", radius=16)
    draw.text((812, 849), "模型职责", font=font(19, True), fill="#87483E")
    draw.text((936, 849), "候选抽取、受限文案、复述评价；无权改资产方向", font=font(18), fill="#87483E")
    draw.text((72, 952), "图 3 · V2.3 参考架构；实线表示目标链路，具体 As-Is/P0 状态以需求追溯表为准。", font=font(17), fill=MUTED)
    canvas.save(OUT / "03-v23-architecture.png", quality=95)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    render_comparison()
    render_product_shape()
    render_architecture()
    print(OUT)


if __name__ == "__main__":
    main()
