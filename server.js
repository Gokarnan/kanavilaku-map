const http=require('http'),fs=require('fs'),path=require('path');
const {WebSocketServer}=require('ws');
const srv=http.createServer((q,r)=>{try{r.writeHead(200,{'Content-Type':'text/html'});r.end(fs.readFileSync(path.join(__dirname,'index.html')))}catch(e){r.writeHead(500);r.end('error')}});
const wss=new WebSocketServer({server:srv}),P=new Map();let n=0;
wss.on('connection',ws=>{
  const id=++n,p={id,name:'Guest'+id,x:0,z:0,y:0,r:0,s:'street'};P.set(id,p);
  ws.send(JSON.stringify({t:'init',id}));
  ws.on('message',d=>{let m;try{m=JSON.parse(d)}catch{return}
    if(m.t==='join')p.name=String(m.name||p.name).slice(0,16);
    else if(m.t==='p'){p.x=+m.x||0;p.z=+m.z||0;p.y=Math.max(0,Math.min(10,+m.y||0));p.r=+m.r||0;p.s=String(m.s||'street').slice(0,30)}});
  ws.on('close',()=>P.delete(id));
});
setInterval(()=>{const msg=JSON.stringify({t:'s',p:[...P.values()].map(p=>[p.id,p.name,p.x,p.z,p.r,p.s,p.y])});
  wss.clients.forEach(c=>c.readyState===1&&c.send(msg))},100);
srv.listen(process.env.PORT||8080,()=>console.log('up'));
