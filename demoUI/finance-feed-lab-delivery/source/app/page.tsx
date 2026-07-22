"use client";

import { useMemo, useState } from "react";

type View = "feed"|"hub"|"concept"|"predict"|"predictResult"|"chain"|"simulation"|"counter"|"retell"|"report";

const steps = [
  {id:"concept", icon:"名", title:"先弄懂关键词", sub:"2 个概念 · 约 40 秒"},
  {id:"predict", icon:"判", title:"预测下一步", sub:"找出第一步传导"},
  {id:"chain", icon:"链", title:"补全因果链", sub:"不是只背结论"},
  {id:"simulation", icon:"演", title:"改变条件再推演", sub:"看结论何时会反转"},
  {id:"counter", icon:"辨", title:"反例挑战", sub:"区分“可能”与“必然”"},
  {id:"retell", icon:"述", title:"用三句话讲明白", sub:"证明自己真的理解"},
] as const;

export default function Home(){
  const [view,setView]=useState<View>("feed");
  const [liked,setLiked]=useState(false);
  const [concept,setConcept]=useState<"fed"|"rate">("fed");
  const [selected,setSelected]=useState("");
  const [completed,setCompleted]=useState<string[]>([]);
  const [risk,setRisk]=useState(false);
  const [growth,setGrowth]=useState<"稳健"|"衰退">("稳健");
  const [inflation,setInflation]=useState<"回落"|"高位">("回落");
  const [retell,setRetell]=useState("");
  const finish=(id:string,next:View)=>{setCompleted(v=>v.includes(id)?v:[...v,id]);setView(next)};
  const impact=useMemo(()=>{
    if(growth==="衰退"&&risk) return {stock:"承压",gold:"偏强",usd:"方向冲突",lead:"衰退与避险情绪主导",tone:"mixed"};
    if(inflation==="高位") return {stock:"震荡",gold:"方向冲突",usd:"偏弱",lead:"通胀预期削弱降息空间",tone:"mixed"};
    return {stock:"偏利好",gold:"偏利好",usd:"偏弱",lead:"融资成本与机会成本主导",tone:"good"};
  },[growth,inflation,risk]);
  const overlay=view!=="feed";
  return <main className="stage"><div className="phone">
    <div className="video-scene"><div className="halo halo-a"/><div className="halo halo-b"/><div className="grid"/>
      <div className="rate-card"><span>FED FUNDS RATE</span><strong>5.25%</strong><div className="line-chart"><i/><i/><i/><i/><i/></div><b>降息 25bp</b></div>
      <div className="host"><div className="head"/><div className="body"/></div>
      <div className="headline">美联储降息<br/>到底影响了什么？</div><div className="subtitle">股票 · 黄金 · 美元的传导逻辑</div>
    </div>
    <header className="topbar"><span>10:24</span><nav><b>精选</b><span>关注</span></nav><div className="status">● ◒ ▰</div></header>
    <button className="concept-chip" onClick={()=>{setConcept("fed");setView("concept")}}>“美联储”是什么？ <b>›</b></button>
    <section className="ai-nudge"><div className="spark">✦</div><div><b>AI 帮你真正看懂</b><span>概念 · 因果 · 条件 · 迁移</span></div><button onClick={()=>setView("hub")}>开始帮练 <em>›</em></button></section>
    <aside className="actions"><button className="avatar">财<span>＋</span></button><button onClick={()=>setLiked(!liked)}><span className="heart">♥</span><small>{liked?"8.3万":"8.2万"}</small></button><button><span className="bubble">●</span><small>3268</small></button><button><span className="star">★</span><small>1.6万</small></button><button><span className="share">➤</span><small>分享</small></button></aside>
    <section className="caption"><b>@财经放映室</b><p>美联储降息，为什么股票、黄金和美元不一定按“标准答案”走？<span> #财经知识 #美联储</span></p><div className="music">♫ 财经放映室的原声 · 正在播放</div></section>
    <footer className="dock"><button><i>⌂</i><b>首页</b></button><button><i>◎</i><b>朋友</b></button><button className="create">＋</button><button><i>▣</i><b>消息</b></button><button><i>♙</i><b>我</b></button></footer>
    {overlay&&<div className="shade" onClick={()=>setView("feed")}/>}

    {view==="hub"&&<Panel title="这条视频，你要学会什么？" tag="✦ AI 帮练 · 约 4 分钟" onClose={()=>setView("feed")}>
      <p className="muted">不替你总结，而是帮你亲自走一遍视频里的逻辑。</p><div className="progress"><i style={{width:`${completed.length/6*100}%`}}/><span>{completed.length}/6</span></div>
      <div className="step-list">{steps.map((s,i)=><button key={s.id} onClick={()=>setView(s.id as View)}><i className={completed.includes(s.id)?"done":""}>{completed.includes(s.id)?"✓":s.icon}</i><span><b>{s.title}</b><small>{s.sub}</small></span><em>{i===0&&completed.length===0?"建议先做":"›"}</em></button>)}</div>
      {completed.length>=4&&<button className="primary" onClick={()=>setView("report")}>查看我的视频掌握报告</button>}
    </Panel>}

    {view==="concept"&&<Panel title="标题里的名词，你都了解吗？" tag="01 · 概念预检" onBack={()=>setView("hub")}>
      <div className="term-tabs"><button className={concept==="fed"?"active":""} onClick={()=>setConcept("fed")}>美联储</button><button className={concept==="rate"?"active":""} onClick={()=>setConcept("rate")}>降息</button></div>
      <div className="term-card"><div className="term-mark">{concept==="fed"?"FED":"↓%"}</div><h3>{concept==="fed"?"美联储":"降息"}</h3><p>{concept==="fed"?"美国的中央银行体系。它通过调整政策利率等工具，影响借贷成本、经济活动与市场预期。":"中央银行下调政策利率。它首先改变资金的价格，再通过融资、收益率和预期影响经济与资产。"}</p><div className="not-equal"><b>别混淆</b><span>{concept==="fed"?"美联储 ≠ 美国财政部":"降息 ≠ 所有贷款利率立刻同步下降"}</span></div><button className="timestamp">▶ 回看视频 00:18 的原话</button></div>
      <div className="know"><span>现在你理解了吗？</span><button onClick={()=>finish("concept","hub")}>理解了</button><button onClick={()=>setConcept(concept==="fed"?"rate":"fed")}>再看一个例子</button></div>
    </Panel>}

    {view==="predict"&&<Panel title="美元资产收益率下降后，哪一步更可能先发生？" tag="02 · 预测下一步" onBack={()=>setView("hub")}>
      <div className="options">{[["a","美元资产吸引力可能下降"],["b","黄金价格必然立即上涨"],["c","所有企业利润同步增加"]].map(x=><button key={x[0]} className={selected===x[0]?"chosen":""} onClick={()=>setSelected(x[0])}><i>{x[0].toUpperCase()}</i><span>{x[1]}</span></button>)}</div><button disabled={!selected} className="primary" onClick={()=>setView("predictResult")}>查看原因</button>
    </Panel>}
    {view==="predictResult"&&<Panel title={selected==="a"?"你抓住了第一步传导":"这里把“可能”说成了“必然”"} tag={selected==="a"?"✓ 判断合理":"△ 发现一个认知误区"} onBack={()=>setView("predict")}>
      <p className="muted">关键不是记住黄金涨跌，而是知道利率先改变资产的相对吸引力；价格还会受到通胀、增长和避险情绪影响。</p><MiniChain/><div className="condition"><b>成立条件</b><span>其他经济体利率没有下降得更多，且避险因素未压倒收益率因素。</span></div><button className="primary" onClick={()=>{setSelected("");finish("predict","chain")}}>下一步：补全因果链</button>
    </Panel>}

    {view==="chain"&&<Panel title="把缺失的中间一步补上" tag="03 · 因果拼图" onBack={()=>setView("hub")}>
      <div className="vertical-chain"><span>美联储降息</span><b>↓</b><span>市场利率下降</span><b>↓</b><button onClick={()=>setSelected("funding")}>{selected==="funding"?"企业融资成本下降":"＋ 点击选择缺失节点"}</button><b>↓</b><span>企业利润预期可能改善</span><b>↓</b><span>股票估值可能上升</span></div>
      {selected==="funding"?<><div className="condition"><b>为什么不能跳过？</b><span>“降息→股市上涨”不是直接作用，中间的资金成本与盈利预期才解释了传导。</span></div><button className="primary" onClick={()=>finish("chain","simulation")}>带着条件去推演</button></>:<div className="node-choices"><button onClick={()=>setSelected("funding")}>企业融资成本下降</button><button onClick={()=>setSelected("wrong")}>企业数量立刻增加</button></div>}
    </Panel>}

    {view==="simulation"&&<Panel title="同样是降息，结果会一样吗？" tag="04 · 变量推演沙盘" onBack={()=>setView("hub")}>
      <div className="controls"><label><span>美联储利率</span><b>↓ 下降</b></label><label><span>经济增长</span><div><button className={growth==="稳健"?"active":""} onClick={()=>setGrowth("稳健")}>稳健</button><button className={growth==="衰退"?"active":""} onClick={()=>setGrowth("衰退")}>衰退</button></div></label><label><span>通胀</span><div><button className={inflation==="回落"?"active":""} onClick={()=>setInflation("回落")}>回落</button><button className={inflation==="高位"?"active":""} onClick={()=>setInflation("高位")}>高位</button></div></label><label><span>避险情绪</span><button className={`toggle ${risk?"on":""}`} onClick={()=>setRisk(!risk)}><i/></button></label></div>
      <div className={`impact ${impact.tone}`}><div><span>股票</span><b>{impact.stock}</b></div><div><span>黄金</span><b>{impact.gold}</b></div><div><span>美元</span><b>{impact.usd}</b></div><p><small>当前主导因素</small>{impact.lead}</p></div><p className="disclaimer">情景推演，不构成投资建议。方向表示“在当前条件下更可能”。</p><button className="primary" onClick={()=>{setSelected("");finish("simulation","counter")}}>接受反例挑战</button>
    </Panel>}

    {view==="counter"&&<Panel title="降息后股市仍下跌，说明视频错了吗？" tag="05 · 反例挑战" onBack={()=>setView("hub")}>
      <div className="options"><button onClick={()=>setSelected("no")}><i>A</i><span>错了，降息后股市就应该上涨</span></button><button onClick={()=>setSelected("yes")}><i>B</i><span>不一定，衰退预期可能压过融资成本下降的利好</span></button></div>{selected==="yes"&&<div className="feedback-inline"><b>✓ 你保留了结论的条件</b><p>经济结果由多条因果链共同决定。反例不是推翻机制，而是在提醒我们检查哪个变量占主导。</p></div>}{selected==="no"&&<div className="feedback-inline warnbox"><b>△ 你忽略了“其他条件不变”</b><p>试着回想：如果企业利润预期快速恶化，估值改善还能主导市场吗？</p></div>}<button disabled={!selected} className="primary" onClick={()=>finish("counter","retell")}>最后：用自己的话讲一遍</button>
    </Panel>}

    {view==="retell"&&<Panel title="用三句话解释：为什么降息可能影响黄金？" tag="06 · 主动复述" onBack={()=>setView("hub")}>
      <textarea value={retell} onChange={e=>setRetell(e.target.value)} placeholder="提示：结论 → 中间因果 → 成立条件"/><div className="speech-actions"><button onClick={()=>setRetell("降息会降低美元资产的利率回报，从而降低持有黄金的机会成本，因此资金可能增加对黄金的配置。但黄金走势还会受到通胀、美元和避险情绪影响，所以并非必然上涨。")}>🎙 模拟语音输入</button><span>{retell.length}/180</span></div>
      {retell.length>20&&<div className="rubric"><div><b>核心结论</b><span>✓</span></div><div><b>中间因果</b><span>{retell.includes("机会成本")?"✓":"待补充"}</span></div><div><b>条件意识</b><span>{retell.includes("不")||retell.includes("但")?"✓":"待补充"}</span></div></div>}<button disabled={retell.length<20} className="primary" onClick={()=>finish("retell","report")}>生成视频掌握报告</button>
    </Panel>}

    {view==="report"&&<Panel title="你不是“看完了”，而是真的学会了" tag="学习完成 · 视频掌握报告" onBack={()=>setView("hub")}>
      <div className="mastery"><div><strong>{completed.length>=5?"理解较扎实":"正在形成理解"}</strong><span>因果与条件意识表现最好</span></div><b>{Math.max(68,completed.length*15)}<small>%</small></b></div>
      <div className="report-grid"><article><span>已掌握</span><b>美联储 · 降息 · 机会成本</b><small>3 / 5 个核心概念</small></article><article><span>能讲清</span><b>2 条关键因果链</b><small>已补全中间节点</small></article><article className="wide"><span>你的理解证据</span><ul><li>能区分“可能”与“必然”</li><li>知道衰退预期可能改变股市方向</li><li>能用机会成本解释黄金传导</li></ul></article><article className="wide review"><span>建议回看</span><b>06:42 为什么降息后股市仍可能下跌</b><button>▶ 回到原视频片段</button></article><article className="wide transfer"><span>迁移挑战</span><b>如果欧洲降息幅度更大，美元还一定走弱吗？</b><small>明天提醒我再回答</small></article></div><button className="primary" onClick={()=>setView("feed")}>完成并收藏掌握报告</button>
    </Panel>}
  </div><div className="desktop-note"><b>财经推演室</b><span>从“刷完”到“真正掌握”</span><small>点击「开始帮练」体验完整闭环</small></div></main>
}

function Panel({title,tag,onBack,onClose,children}:{title:string;tag:string;onBack?:()=>void;onClose?:()=>void;children:React.ReactNode}){
 return <section className="sheet full-sheet"><header>{onBack?<button onClick={onBack}>‹</button>:<span/>}<small>{tag}</small><button onClick={onClose||onBack}>×</button></header><h2>{title}</h2>{children}</section>
}
function MiniChain(){return <div className="mini-chain"><span>降息</span><b>→</b><span>美元收益率↓</span><b>→</b><span>吸引力可能↓</span></div>}
