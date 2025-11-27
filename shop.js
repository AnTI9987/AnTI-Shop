export const shopItems=[
  {id:1,name:'Оторванная пуговица',cost:50,description:'Похожа на глаз игрушки.',property:'+1 за клик',incrementCost:50,img:'img/item-1.png'},
  {id:2,name:'Страшная штука',cost:250,description:'Она пугает.',property:'+10 за клик',power:10,stock:5,img:'img/item-2.png'}
];

export function renderShop({coins, clickPower}){
  const itemsBlock=document.getElementById("items");
  itemsBlock.innerHTML="";
  shopItems.forEach(item=>{
    const d=document.createElement("div"); d.className="item";
    d.innerHTML=`<div class="item-top"><img src="${item.img}"><div class="item-text"><b>${item.name}</b><p>${item.description}</p><p>${item.property}</p></div></div>`;
    if(item.stock!==undefined){ const s=document.createElement("p"); s.className="stock"; s.textContent="В наличии: "+item.stock; d.appendChild(s);}
    const btn=document.createElement("button"); d.appendChild(btn); updateButtonText(item,btn, coins);
    btn.onclick=()=>{
      if(item.stock!==undefined && item.stock<=0)return;
      if(coins<item.cost)return;
      coins-=item.cost;
      if(item.id===1){ clickPower+=1; item.cost+=item.incrementCost;}
      if(item.id===2){ clickPower+=item.power; item.cost+=250; item.stock=Math.max(0,item.stock-1);}
      updateButtonText(item,btn, coins);
      if(item.stock!==undefined){ const st=d.querySelector(".stock"); st.textContent=item.stock>0?"В наличии: "+item.stock:""; }
    };
    itemsBlock.appendChild(d);
  });
}

export function updateButtonText(item,btn, coins){
  btn.innerHTML="";
  if(item.stock!==undefined && item.stock<=0){ btn.textContent="распродано"; btn.disabled=true; return; }
  const p=document.createElement("div");
  p.className="price";
  p.innerHTML=`${item.cost}<img src="img/anti-coin.png">`;
  p.querySelector("img").style.width="18px";
  p.querySelector("img").style.height="18px";
  p.querySelector("img").style.objectFit="contain";
  p.style.color=coins<item.cost?"#ff3333":"#fff";
  btn.appendChild(p);
}
