export default function Avatar({ name = '?', size = 40 }){
  const letter = (name || '?').trim().charAt(0).toUpperCase()
  const bg = pick(name)
  return (
    <div style={{
      width:size,height:size,borderRadius:'50%',display:'grid',placeItems:'center',
      background:bg, color:'rgba(255,255,255,.92)', fontWeight:700
    }}>
      {letter}
    </div>
  )
}

// deterministic color from name
function pick(str){
  let h = 0
  for(let i=0;i<str.length;i++) h = (h*31 + str.charCodeAt(i))|0
  const hue = Math.abs(h)%360
  return `hsl(${hue} 70% 40%)`
}
