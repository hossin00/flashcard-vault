import { useState } from 'react';
import { BookOpen, Plus, Trash2, X, ChevronLeft, ChevronRight, RotateCcw, Check } from 'lucide-react';
const C='#22c55e';
interface Card { id:string; front:string; back:string; interval:number; dueAt:number; }
interface Deck { id:string; name:string; color:string; cards:Card[]; createdAt:number; }
const COLORS=['#22c55e','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];
const SK='fv_decks_v1';
const ld=():Deck[]=>{try{return JSON.parse(localStorage.getItem(SK)||'[]')}catch{return[]}};

export default function App() {
  const [decks,setDecks]=useState<Deck[]>(ld);
  const [view,setView]=useState<'list'|'deck'|'study'|'addCard'>('list');
  const [selDeck,setSelDeck]=useState<Deck|null>(null);
  const [cardIdx,setCardIdx]=useState(0);
  const [flipped,setFlipped]=useState(false);
  const [showAddDeck,setShowAddDeck]=useState(false);
  const [deckName,setDeckName]=useState('');
  const [deckColor,setDeckColor]=useState(C);
  const [cardFront,setCardFront]=useState('');
  const [cardBack,setCardBack]=useState('');
  const [studied,setStudied]=useState(0);

  const sv=(items:Deck[])=>{setDecks(items);localStorage.setItem(SK,JSON.stringify(items))};

  const addDeck=()=>{
    if(!deckName.trim())return;
    sv([{id:crypto.randomUUID(),name:deckName.trim(),color:deckColor,cards:[],createdAt:Date.now()},...decks]);
    setDeckName('');setShowAddDeck(false);
  };

  const addCard=()=>{
    if(!cardFront.trim()||!cardBack.trim()||!selDeck)return;
    const card:Card={id:crypto.randomUUID(),front:cardFront.trim(),back:cardBack.trim(),interval:1,dueAt:Date.now()};
    const updated=decks.map(d=>d.id===selDeck.id?{...d,cards:[...d.cards,card]}:d);
    sv(updated);
    setSelDeck(updated.find(d=>d.id===selDeck.id)||null);
    setCardFront('');setCardBack('');setView('deck');
  };

  const grade=(good:boolean)=>{
    if(!selDeck)return;
    const card=selDeck.cards[cardIdx];
    const newInterval=good?card.interval*2:1;
    const updatedCard={...card,interval:newInterval,dueAt:Date.now()+newInterval*24*60*60*1000};
    const updCards=selDeck.cards.map(c=>c.id===card.id?updatedCard:c);
    const updDecks=decks.map(d=>d.id===selDeck.id?{...d,cards:updCards}:d);
    sv(updDecks);
    setSelDeck({...selDeck,cards:updCards});
    if(good)setStudied(s=>s+1);
    if(cardIdx<selDeck.cards.length-1){setCardIdx(i=>i+1);setFlipped(false);}
    else{setView('deck');setCardIdx(0);setFlipped(false);}
  };

  const inp={width:'100%',background:'#081408',border:`1px solid ${C}20`,borderRadius:'10px',padding:'11px 14px',color:'white',fontSize:'14px',outline:'none',fontFamily:'Inter',resize:'none' as const};

  if(view==='study'&&selDeck&&selDeck.cards.length>0){
    const card=selDeck.cards[cardIdx]||selDeck.cards[0];
    return (
      <div style={{minHeight:'100vh',background:'#080f08',display:'flex',flexDirection:'column'}}>
        <div style={{padding:'14px 20px',borderBottom:`1px solid ${C}20`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <button onClick={()=>{setView('deck');setCardIdx(0);setFlipped(false);}} style={{color:C,background:'none',border:'none',cursor:'pointer',fontSize:'14px',fontFamily:'Inter'}}>← Exit</button>
          <span style={{color:'#6b7280',fontSize:'13px'}}>{cardIdx+1} / {selDeck.cards.length}</span>
          <span style={{color:C,fontSize:'13px',fontWeight:'600'}}>{studied} learned</span>
        </div>
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px'}}>
          <div onClick={()=>setFlipped(!flipped)} style={{width:'100%',maxWidth:'400px',minHeight:'220px',borderRadius:'20px',background:flipped?`${selDeck.color}15`:'#0f1a0f',border:`2px solid ${flipped?selDeck.color:selDeck.color+'30'}`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'32px',cursor:'pointer',transition:'all 0.3s'}}>
            <div style={{fontSize:'10px',color:`${selDeck.color}60`,fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'16px'}}>{flipped?'ANSWER':'QUESTION'}</div>
            <div style={{fontSize:'20px',color:'white',textAlign:'center',lineHeight:'1.6',fontWeight:'500'}}>{flipped?card.back:card.front}</div>
            {!flipped&&<div style={{marginTop:'16px',fontSize:'12px',color:`${selDeck.color}40`}}>Tap to reveal answer</div>}
          </div>
          {flipped&&(
            <div style={{display:'flex',gap:'12px',marginTop:'24px',width:'100%',maxWidth:'400px'}}>
              <button onClick={()=>grade(false)} style={{flex:1,padding:'14px',borderRadius:'12px',background:'#ef444415',border:'1px solid #ef444430',color:'#f87171',fontSize:'15px',fontWeight:'600',cursor:'pointer',fontFamily:'Inter'}}>❌ Hard</button>
              <button onClick={()=>grade(true)} style={{flex:1,padding:'14px',borderRadius:'12px',background:`${selDeck.color}20`,border:`1px solid ${selDeck.color}40`,color:selDeck.color,fontSize:'15px',fontWeight:'600',cursor:'pointer',fontFamily:'Inter'}}>✓ Got it</button>
            </div>
          )}
          <div style={{height:'6px',background:`${selDeck.color}15`,borderRadius:'3px',overflow:'hidden',marginTop:'24px',width:'100%',maxWidth:'400px'}}>
            <div style={{width:`${((cardIdx)/selDeck.cards.length)*100}%`,height:'100%',background:selDeck.color,borderRadius:'3px'}}/>
          </div>
        </div>
      </div>
    );
  }

  if(view==='deck'&&selDeck) return (
    <div style={{minHeight:'100vh',background:'#080f08',display:'flex',flexDirection:'column'}}>
      <div style={{padding:'14px 20px',borderBottom:`1px solid ${selDeck.color}20`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <button onClick={()=>setView('list')} style={{color:selDeck.color,background:'none',border:'none',cursor:'pointer',fontSize:'14px',fontFamily:'Inter'}}>← Decks</button>
        <span style={{color:'white',fontSize:'15px',fontWeight:'600'}}>{selDeck.name}</span>
        <button onClick={()=>setView('addCard')} style={{padding:'6px 12px',borderRadius:'8px',background:selDeck.color,border:'none',color:'white',fontSize:'12px',fontWeight:'600',cursor:'pointer',fontFamily:'Inter'}}>+ Card</button>
      </div>
      <div style={{flex:1,overflow:'auto',padding:'16px 20px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'10px',marginBottom:'16px'}}>
          {[['Cards',selDeck.cards.length],['Due',selDeck.cards.filter(c=>c.dueAt<=Date.now()).length],['Studied',studied]].map(([l,v])=>(
            <div key={String(l)} style={{background:`${selDeck.color}08`,border:`1px solid ${selDeck.color}20`,borderRadius:'12px',padding:'12px',textAlign:'center'}}>
              <div style={{fontSize:'22px',fontWeight:'700',color:selDeck.color}}>{v}</div>
              <div style={{fontSize:'10px',color:'#6b7280',marginTop:'2px'}}>{l}</div>
            </div>
          ))}
        </div>
        {selDeck.cards.length>0&&(
          <button onClick={()=>{setCardIdx(0);setFlipped(false);setStudied(0);setView('study');}} style={{width:'100%',padding:'14px',borderRadius:'12px',background:selDeck.color,border:'none',color:'white',fontSize:'15px',fontWeight:'700',cursor:'pointer',fontFamily:'Inter',marginBottom:'16px',boxShadow:`0 4px 16px ${selDeck.color}30`}}>
            Study Now ({selDeck.cards.length} cards)
          </button>
        )}
        <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
          {selDeck.cards.map((card,i)=>(
            <div key={card.id} style={{background:`${selDeck.color}08`,border:`1px solid ${selDeck.color}20`,borderRadius:'10px',padding:'12px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{color:'white',fontSize:'13px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{card.front}</div>
                <div style={{color:`${selDeck.color}60`,fontSize:'11px',marginTop:'2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{card.back}</div>
              </div>
              <button onClick={()=>{const upd={...selDeck,cards:selDeck.cards.filter(c=>c.id!==card.id)};sv(decks.map(d=>d.id===upd.id?upd:d));setSelDeck(upd);}} style={{padding:'4px',background:'none',border:'none',cursor:'pointer',color:`${selDeck.color}40`,flexShrink:0}}><Trash2 size={12}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if(view==='addCard'&&selDeck) return (
    <div style={{minHeight:'100vh',background:'#080f08',display:'flex',flexDirection:'column'}}>
      <div style={{padding:'14px 20px',borderBottom:`1px solid ${selDeck.color}20`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <button onClick={()=>setView('deck')} style={{color:selDeck.color,background:'none',border:'none',cursor:'pointer',fontSize:'14px',fontFamily:'Inter'}}>← Back</button>
        <span style={{color:'white',fontSize:'15px',fontWeight:'600'}}>New Card</span>
        <div/>
      </div>
      <div style={{flex:1,padding:'20px',display:'flex',flexDirection:'column',gap:'12px'}}>
        <div>
          <label style={{fontSize:'11px',color:`${selDeck.color}60`,fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.08em',display:'block',marginBottom:'8px'}}>FRONT (Question)</label>
          <textarea value={cardFront} onChange={e=>setCardFront(e.target.value)} placeholder="Enter the question..." rows={4} style={inp} autoFocus/>
        </div>
        <div>
          <label style={{fontSize:'11px',color:`${selDeck.color}60`,fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.08em',display:'block',marginBottom:'8px'}}>BACK (Answer)</label>
          <textarea value={cardBack} onChange={e=>setCardBack(e.target.value)} placeholder="Enter the answer..." rows={4} style={inp}/>
        </div>
        <button onClick={addCard} disabled={!cardFront.trim()||!cardBack.trim()} style={{padding:'14px',borderRadius:'12px',background:!cardFront.trim()||!cardBack.trim()?'#0f1a0f':selDeck.color,border:'none',color:'white',fontSize:'15px',fontWeight:'700',cursor:'pointer',fontFamily:'Inter',opacity:!cardFront.trim()||!cardBack.trim()?0.5:1}}>Add Card</button>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:'#080f08',display:'flex',flexDirection:'column'}}>
      <header style={{padding:'16px 20px',borderBottom:`1px solid ${C}20`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'36px',height:'36px',borderRadius:'10px',background:`linear-gradient(135deg,${C},#16a34a)`,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 4px 14px ${C}30`}}><BookOpen size={16} color="white"/></div>
          <div><div style={{fontWeight:'700',fontSize:'16px',color:'white',lineHeight:1}}>FlashCard Vault</div>
          <div style={{fontSize:'11px',color:`${C}60`,marginTop:'2px'}}>{decks.length} decks</div></div>
        </div>
        <button onClick={()=>setShowAddDeck(true)} style={{display:'flex',alignItems:'center',gap:'5px',padding:'8px 14px',borderRadius:'9px',background:C,border:'none',color:'white',fontSize:'13px',fontWeight:'600',cursor:'pointer',fontFamily:'Inter',boxShadow:`0 4px 12px ${C}30`}}>
          <Plus size={13}/> New Deck
        </button>
      </header>
      <div style={{flex:1,overflow:'auto',padding:'14px 20px'}}>
        {decks.length===0?(
          <div style={{textAlign:'center',padding:'60px 20px'}}>
            <div style={{fontSize:'52px',marginBottom:'16px'}}>🃏</div>
            <h3 style={{fontSize:'20px',fontWeight:'700',color:'white',marginBottom:'8px'}}>Create your first deck</h3>
            <p style={{color:`${C}60`,fontSize:'14px',lineHeight:'1.6',maxWidth:'240px',margin:'0 auto 24px'}}>Study anything with spaced repetition flashcards.</p>
            <button onClick={()=>setShowAddDeck(true)} style={{padding:'12px 24px',borderRadius:'10px',background:C,border:'none',color:'white',fontSize:'14px',fontWeight:'600',cursor:'pointer',fontFamily:'Inter'}}>Create first deck</button>
          </div>
        ):(
          <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
            {decks.map(d=>(
              <div key={d.id} style={{background:`${d.color}08`,border:`1px solid ${d.color}20`,borderRadius:'12px',padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer'}} onClick={()=>{setSelDeck(d);setView('deck');}}>
                <div>
                  <div style={{color:'white',fontSize:'14px',fontWeight:'500',marginBottom:'2px'}}>{d.name}</div>
                  <div style={{color:`${d.color}80`,fontSize:'12px'}}>{d.cards.length} cards · {d.cards.filter(c=>c.dueAt<=Date.now()).length} due</div>
                </div>
                <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                  {d.cards.length>0&&<div style={{width:'32px',height:'32px',borderRadius:'50%',background:`${d.color}20`,border:`1px solid ${d.color}30`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <BookOpen size={14} style={{color:d.color}}/>
                  </div>}
                  <button onClick={e=>{e.stopPropagation();sv(decks.filter(x=>x.id!==d.id));}} style={{padding:'4px',background:'none',border:'none',cursor:'pointer',color:`${d.color}40`}}><Trash2 size={13}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showAddDeck&&(
        <div style={{position:'fixed',inset:0,background:'#00000080',zIndex:50,display:'flex',alignItems:'flex-end'}} onClick={e=>e.target===e.currentTarget&&setShowAddDeck(false)}>
          <div style={{width:'100%',background:'#0a140a',borderRadius:'20px 20px 0 0',border:`1px solid ${C}20`,padding:'24px'}}>
            <div style={{width:'36px',height:'3px',background:'#0f1a0f',borderRadius:'2px',margin:'0 auto 20px'}}/>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'14px'}}>
              <h3 style={{color:'white',fontSize:'16px',fontWeight:'700',fontFamily:'Inter'}}>New Deck</h3>
              <button onClick={()=>setShowAddDeck(false)} style={{background:'none',border:'none',cursor:'pointer',color:`${C}60`}}><X size={16}/></button>
            </div>
            <input value={deckName} onChange={e=>setDeckName(e.target.value)} placeholder="Deck name" autoFocus
              style={{...inp,marginBottom:'10px'}}/>
            <div style={{display:'flex',gap:'6px',marginBottom:'12px'}}>{COLORS.map(c=><button key={c} onClick={()=>setDeckColor(c)} style={{width:'28px',height:'28px',borderRadius:'50%',background:c,border:`2px solid ${deckColor===c?'white':c+'60'}`,cursor:'pointer'}}/>)}</div>
            <button onClick={addDeck} style={{width:'100%',padding:'14px',borderRadius:'12px',background:C,border:'none',color:'white',fontSize:'15px',fontWeight:'700',cursor:'pointer',fontFamily:'Inter'}}>Create Deck</button>
          </div>
        </div>
      )}
    </div>
  );
}