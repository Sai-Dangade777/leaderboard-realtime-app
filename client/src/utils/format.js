export function formatNumber(n){
  if(n === undefined || n === null) return '0'
  return n.toLocaleString()
}

export function rankColor(rank){
  if(rank===1) return '#f59e0b' // gold
  if(rank===2) return '#9ca3af' // silver
  if(rank===3) return '#d97706' // bronze
  return '#7dd3fc'
}
