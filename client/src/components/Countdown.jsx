import { useEffect, useState } from 'react'

function getWindowEnd(windowKey){
  const now = new Date()
  if(windowKey==='daily'){
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1)
    end.setHours(0,0,0,0)
    return end
  }
  if(windowKey==='weekly'){
    const day = now.getDay() // 0..6
    const diff = (day===0?0:7-day) // days to Sunday end
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate()+diff+1)
    end.setHours(0,0,0,0)
    return end
  }
  if(windowKey==='monthly'){
    const end = new Date(now.getFullYear(), now.getMonth()+1, 1)
    end.setHours(0,0,0,0)
    return end
  }
  // all: no end
  return null
}

function formatDiff(ms){
  if(ms<=0) return '00:00:00'
  let s = Math.floor(ms/1000)
  const d = Math.floor(s/86400); s -= d*86400
  const h = Math.floor(s/3600); s -= h*3600
  const m = Math.floor(s/60); s -= m*60
  const pad = n => String(n).padStart(2,'0')
  return d>0 ? `${d} days ${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(h)}:${pad(m)}:${pad(s)}`
}

export default function Countdown({ windowKey='monthly' }){
  const [txt,setTxt] = useState('')
  useEffect(()=>{
    const tick = ()=>{
      const end = getWindowEnd(windowKey)
      if(!end){ setTxt('—'); return }
      const ms = end - new Date()
      setTxt(formatDiff(ms))
    }
    tick()
    const id = setInterval(tick, 1000)
    return ()=> clearInterval(id)
  }, [windowKey])
  return <span>{txt}</span>
}
