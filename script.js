(function(){
"use strict";

/* ================= PRODUCT DATA ================= */
const img = (seed,w=900,h=1200)=>`https://picsum.photos/seed/${seed}/${w}/${h}`;

const COLLECTIONS = [
  {id:'new-era',name:'New Era',tag:'SS30 · The opening statement',img:img('thrifty-coll-1',1600,1000)},
  {id:'street-form',name:'Street Form',tag:'Structured silhouettes, city-built',img:img('thrifty-coll-2',1600,1000)},
  {id:'essentials',name:'Essentials',tag:'The pieces you reach for daily',img:img('thrifty-coll-3',1600,1000)},
  {id:'after-dark',name:'After Dark',tag:'Low light, high contrast',img:img('thrifty-coll-4',1600,1000)},
  {id:'limited-drop',name:'Limited Drop',tag:'147 units. Then gone.',img:img('thrifty-coll-5',1600,1000)},
];

const COLORS = {
  'Void Black':'#1a1a1c','Bone White':'#eae6db','Electric Cyan':'#00e5ff','Acid Lime':'#d7ff3f',
  'Soft Violet':'#8b7cff','Steel Grey':'#6b6b72','Rust Clay':'#b8623f','Deep Navy':'#1e2a4a','Sand':'#c9b696'
};
const COLOR_NAMES = Object.keys(COLORS);
const SIZES = ['XS','S','M','L','XL','XXL'];
const SIZE_TABLE = [
  {size:'XS',chest:34,length:26,shoulder:16,waist:28},
  {size:'S',chest:36,length:27,shoulder:16.5,waist:30},
  {size:'M',chest:39,length:28,shoulder:17.5,waist:32},
  {size:'L',chest:42,length:29,shoulder:18.5,waist:34},
  {size:'XL',chest:45,length:30,shoulder:19.5,waist:37},
  {size:'XXL',chest:48,length:31,shoulder:20.5,waist:40},
];

function seedName(i,cat){
  const men=['Vector Overshirt','Nomad Cargo Pant','Halo Bomber','Grid Tee','Vantage Hoodie','Circuit Jacket','Drift Chino','Frame Jacket'];
  const women=['Lumen Slip Dress','Aria Wrap Top','Nova Pleated Skirt','Echo Knit Set','Prism Blazer','Mirage Midi Dress','Aster Cropped Jacket','Solace Wide Pant'];
  const uni=['Orbit Puffer','Static Tee','Terra Utility Vest','Flux Track Pant','Origin Hoodie'];
  const pool = cat==='Men'?men:cat==='Women'?women:uni;
  return pool[i % pool.length];
}

const RAW = [
  {cat:'Men',collection:'new-era',badge:'new'},
  {cat:'Women',collection:'after-dark',badge:'trend'},
  {cat:'Unisex',collection:'essentials',badge:null},
  {cat:'Men',collection:'street-form',badge:'low'},
  {cat:'Women',collection:'new-era',badge:'trend'},
  {cat:'Men',collection:'limited-drop',badge:'new'},
  {cat:'Women',collection:'street-form',badge:null},
  {cat:'Unisex',collection:'after-dark',badge:'trend'},
  {cat:'Men',collection:'essentials',badge:null},
  {cat:'Women',collection:'limited-drop',badge:'low'},
  {cat:'Men',collection:'new-era',badge:null},
  {cat:'Women',collection:'essentials',badge:'new'},
  {cat:'Unisex',collection:'street-form',badge:null},
  {cat:'Men',collection:'after-dark',badge:'trend'},
  {cat:'Women',collection:'new-era',badge:null},
  {cat:'Unisex',collection:'limited-drop',badge:'low'},
];

const PRODUCTS = RAW.map((r,i)=>{
  const price = 48 + ((i*37)%180);
  const hasDiscount = i % 3 === 0;
  const original = hasDiscount ? Math.round(price * 1.35) : null;
  const discount = hasDiscount ? Math.round((1-price/original)*100) : 0;
  const rating = (3.6 + ((i*13)%14)/10).toFixed(1);
  const reviews = 20 + (i*17)%420;
  const colors = [COLOR_NAMES[i%9], COLOR_NAMES[(i+3)%9], COLOR_NAMES[(i+6)%9]];
  const sizes = SIZES.filter((s,si)=> !(i%7===0 && si===4));
  return {
    id:'p'+(i+1),
    name: seedName(i,r.cat),
    cat: r.cat,
    collection: r.collection,
    price, original, discount,
    rating:+rating, reviews,
    badge:r.badge,
    colors,
    sizes,
    stock: i%5===0 ? (2+i%4) : 40,
    img1: img('thrifty-p'+(i+1)+'a',900,1200),
    img2: img('thrifty-p'+(i+1)+'b',900,1200),
    gallery:[img('thrifty-p'+(i+1)+'a',900,1200),img('thrifty-p'+(i+1)+'b',900,1200),img('thrifty-p'+(i+1)+'c',900,1200),img('thrifty-p'+(i+1)+'d',900,1200)],
    fabric:['Premium Cotton Blend','Recycled Polyester Twill','Brushed Cotton Fleece','Technical Nylon Weave'][i%4],
    fit:['Oversized','Relaxed','Tailored','Slim'][i%4],
    weight:(260+((i*11)%140))+' GSM',
    material:['100% Cotton','65% Cotton / 35% Poly','92% Cotton / 8% Elastane','100% Recycled Nylon'][i%4],
    desc:`A ${['refined','considered','engineered','minimal'][i%4]} take on the ${r.cat.toLowerCase()} staple, cut for movement and built to outlast a season. Designed in-house, finished with tonal hardware and a fit that holds its shape wear after wear.`
  };
});

/* ================= STATE ================= */
const LS_CART='thrifty_cart', LS_WISH='thrifty_wishlist', LS_RECENT='thrifty_recent_searches';
let cart = JSON.parse(localStorage.getItem(LS_CART)||'[]');
let wishlist = JSON.parse(localStorage.getItem(LS_WISH)||'[]');
let recentSearches = JSON.parse(localStorage.getItem(LS_RECENT)||'[]');

let activeFilters = { cat:'all', sale:false, sizes:[], colors:[], collections:[], maxPrice:300, minRating:0, inStockOnly:false };
let activeSort='featured';
let currentProduct=null, currentPdpColorIdx=0, currentPdpSize=null, currentPdpQty=1, currentPdpImgIdx=0;

function saveCart(){localStorage.setItem(LS_CART,JSON.stringify(cart));}
function saveWish(){localStorage.setItem(LS_WISH,JSON.stringify(wishlist));}
function saveRecent(){localStorage.setItem(LS_RECENT,JSON.stringify(recentSearches));}
function findProduct(id){return PRODUCTS.find(p=>p.id===id);}
function fmt(n){return '$'+n.toFixed(2).replace(/\.00$/,'');}

/* ================= TOAST ================= */
let toastTimer;
function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove('show'),2200);
}

/* ================= LOADER ================= */
window.addEventListener('load',()=>{
  let pct=0;
  const fill=document.getElementById('loaderFill'), pctEl=document.getElementById('loaderPct');
  const iv=setInterval(()=>{
    pct += Math.random()*18+8;
    if(pct>=100){pct=100;clearInterval(iv);}
    fill.style.width=pct+'%';
    pctEl.textContent='Loading experience — '+Math.floor(pct)+'%';
    if(pct===100){
      setTimeout(()=>{
        document.getElementById('loader').classList.add('hide');
        document.body.classList.remove('lock');
        initRevealObservers();
      },320);
    }
  },180);
});
document.body.classList.add('lock');

/* ================= CUSTOM CURSOR ================= */
const cdot=document.getElementById('cdot'), cring=document.getElementById('cring');
let mx=0,my=0,rx=0,ry=0;
window.addEventListener('mousemove',e=>{
  mx=e.clientX;my=e.clientY;
  cdot.style.left=mx+'px';cdot.style.top=my+'px';
});
(function raf(){
  rx += (mx-rx)*0.18; ry += (my-ry)*0.18;
  cring.style.left=rx+'px'; cring.style.top=ry+'px';
  requestAnimationFrame(raf);
})();
document.addEventListener('mouseover',e=>{
  if(e.target.closest('a,button,.pcard-frame,.coll-card,.tcard,input,select')) cring.classList.add('grow');
});
document.addEventListener('mouseout',e=>{
  if(e.target.closest('a,button,.pcard-frame,.coll-card,.tcard,input,select')) cring.classList.remove('grow');
});

/* ================= MAGNETIC BUTTONS ================= */
document.querySelectorAll('[data-magnetic]').forEach(btn=>{
  btn.addEventListener('mousemove',e=>{
    const r=btn.getBoundingClientRect();
    const x=e.clientX-r.left-r.width/2, y=e.clientY-r.top-r.height/2;
    btn.style.transform=`translate(${x*0.25}px,${y*0.35}px)`;
  });
  btn.addEventListener('mouseleave',()=>{btn.style.transform='';});
});

/* ================= HERO PARALLAX ================= */
const heroChips=document.getElementById('heroChips'), heroBg=document.getElementById('heroBg');
document.getElementById('hero').addEventListener('mousemove',e=>{
  const r=e.currentTarget.getBoundingClientRect();
  const px=(e.clientX-r.left)/r.width - 0.5, py=(e.clientY-r.top)/r.height - 0.5;
  heroChips.querySelectorAll('.chip').forEach((chip,i)=>{
    const depth=(i%3+1)*10;
    chip.style.transform=`translate(${px*depth}px,${py*depth}px)`;
  });
  heroBg.style.transform=`translate(${px*-12}px,${py*-12}px) scale(1.03)`;
});
window.addEventListener('scroll',()=>{
  const nav=document.getElementById('nav');
  nav.classList.toggle('scrolled',window.scrollY>30);
},{passive:true});

/* ================= SCROLL REVEAL ================= */
function initRevealObservers(){
  const io=new IntersectionObserver((entries)=>{
    entries.forEach(en=>{ if(en.isIntersecting){en.target.classList.add('in'); io.unobserve(en.target);} });
  },{threshold:0.15});
  document.querySelectorAll('.reveal-up').forEach(el=>io.observe(el));
}

/* ================= RENDER: TRENDING CAROUSEL ================= */
function renderTrending(){
  const wrap=document.getElementById('trendingCarousel');
  const trending = PRODUCTS.filter(p=>p.badge).concat(PRODUCTS.slice(0,4));
  wrap.innerHTML = trending.slice(0,10).map(p=>`
    <div class="tcard" data-id="${p.id}">
      <img class="tcard-img" src="${p.img1}" alt="${p.name}" loading="lazy">
      <div class="tcard-body">
        <div class="tcard-tag">${p.badge==='trend'?'🔥 TRENDING':p.badge==='new'?'✦ NEW':p.badge==='low'?'⚠ LOW STOCK':'★ FEATURED'}</div>
        <div class="tcard-name">${p.name}</div>
        <div class="tcard-price">${fmt(p.price)}</div>
      </div>
    </div>`).join('');
  wrap.querySelectorAll('.tcard').forEach(c=>c.addEventListener('click',()=>openPDP(c.dataset.id)));
}
document.getElementById('tPrev').addEventListener('click',()=>document.getElementById('trendingCarousel').scrollBy({left:-500,behavior:'smooth'}));
document.getElementById('tNext').addEventListener('click',()=>document.getElementById('trendingCarousel').scrollBy({left:500,behavior:'smooth'}));

/* ================= RENDER: PRODUCT GRID ================= */
function ratingStars(r){
  let s='';
  for(let i=1;i<=5;i++){ s+= `<svg viewBox="0 0 24 24" style="opacity:${i<=Math.round(r)?1:.25}"><path d="M12 2l3.1 6.6 7.2.9-5.3 5 1.4 7.2L12 18.3l-6.4 3.4 1.4-7.2-5.3-5 7.2-.9z"/></svg>`;
  }
  return s;
}
function productCardHTML(p, sizeClass){
  const isWished = wishlist.includes(p.id);
  const badge = p.badge==='trend'?'<span class="pbadge trend">🔥 TRENDING</span>':p.badge==='new'?'<span class="pbadge new">✦ NEW</span>':p.badge==='low'?'<span class="pbadge low">LOW STOCK</span>':'';
  return `
  <div class="pcard ${sizeClass}" data-id="${p.id}">
    <div class="pcard-frame">
      <div class="pcard-media">
        <img class="pcard-img img1" src="${p.img1}" alt="${p.name}" loading="lazy">
        <img class="pcard-img img2" src="${p.img2}" alt="${p.name} alternate view" loading="lazy">
        <div class="pcard-badges">${badge}</div>
        <button class="pcard-wish ${isWished?'active':''}" data-wish="${p.id}" aria-label="Add to wishlist">
          <svg viewBox="0 0 24 24" stroke-width="1.8"><path d="M12 21s-7.5-4.6-10-9.3C.6 8 2 4.5 5.4 4A5.4 5.4 0 0 1 12 7a5.4 5.4 0 0 1 6.6-3c3.4.5 4.8 4 3.4 7.7C19.5 16.4 12 21 12 21z"/></svg>
        </button>
        <div class="pcard-panel">
          <div class="pcard-cat">${p.cat} · ${p.collection.replace('-',' ')}</div>
          <div class="pcard-name">${p.name}</div>
          <div class="pcard-meta">
            <div class="pcard-price-row">
              <span class="pcard-price">${fmt(p.price)}</span>
              ${p.original?`<span class="pcard-price-old">${fmt(p.original)}</span>`:''}
            </div>
            <div class="pcard-rating"><svg viewBox="0 0 24 24"><path d="M12 2l3.1 6.6 7.2.9-5.3 5 1.4 7.2L12 18.3l-6.4 3.4 1.4-7.2-5.3-5 7.2-.9z"/></svg>${p.rating}</div>
          </div>
          <div class="pcard-colors">${p.colors.map(c=>`<span class="cswatch" style="background:${COLORS[c]}"></span>`).join('')}</div>
        </div>
        <button class="pcard-quickadd" data-quickadd="${p.id}">Quick add — ${fmt(p.price)}</button>
      </div>
    </div>
  </div>`;
}
function currentFilteredSorted(){
  let list = PRODUCTS.filter(p=>{
    if(activeFilters.cat!=='all' && activeFilters.cat!=='sale' && p.cat!==activeFilters.cat) return false;
    if(activeFilters.sale && !p.original) return false;
    if(activeFilters.sizes.length && !activeFilters.sizes.some(s=>p.sizes.includes(s))) return false;
    if(activeFilters.colors.length && !activeFilters.colors.some(c=>p.colors.includes(c))) return false;
    if(activeFilters.collections.length && !activeFilters.collections.includes(p.collection)) return false;
    if(p.price>activeFilters.maxPrice) return false;
    if(p.rating<activeFilters.minRating) return false;
    if(activeFilters.inStockOnly && p.stock<5) return false;
    return true;
  });
  switch(activeSort){
    case 'newest': list=list.slice().reverse(); break;
    case 'price-asc': list=list.slice().sort((a,b)=>a.price-b.price); break;
    case 'price-desc': list=list.slice().sort((a,b)=>b.price-a.price); break;
    case 'rating': list=list.slice().sort((a,b)=>b.rating-a.rating); break;
    default: break;
  }
  return list;
}
function renderGrid(){
  const grid=document.getElementById('productGrid');
  const list=currentFilteredSorted();
  document.getElementById('resultCount').textContent = list.length ? `Showing ${list.length} piece${list.length===1?'':'s'}.` : 'No pieces match these filters.';
  if(!list.length){
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg><p>Nothing here yet — try clearing a filter.</p></div>`;
    return;
  }
  grid.innerHTML = list.map((p,i)=>{
    const cls = i%7===0 ? 'large' : (i%5===2 ? 'tall' : '');
    return productCardHTML(p,cls);
  }).join('');
  grid.querySelectorAll('.pcard-frame').forEach(el=>{
    el.addEventListener('click',(e)=>{
      if(e.target.closest('[data-wish],[data-quickadd]')) return;
      openPDP(el.closest('.pcard').dataset.id);
    });
  });
  grid.querySelectorAll('[data-wish]').forEach(btn=>{
    btn.addEventListener('click',(e)=>{e.stopPropagation();toggleWish(btn.dataset.wish,btn);});
  });
  grid.querySelectorAll('[data-quickadd]').forEach(btn=>{
    btn.addEventListener('click',(e)=>{
      e.stopPropagation();
      const p=findProduct(btn.dataset.quickadd);
      addToCart(p, p.colors[0], p.sizes[Math.min(2,p.sizes.length-1)], 1, e.target);
    });
  });
}

/* ================= FILTER BAR ================= */
document.querySelectorAll('[data-filter-cat]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('[data-filter-cat]').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const val=btn.dataset.filterCat;
    activeFilters.cat = val;
    activeFilters.sale = val==='sale';
    document.querySelectorAll('[data-filter-sale]').forEach(b=>b.classList.remove('active'));
    renderGrid();
  });
});
document.querySelector('[data-filter-sale]').addEventListener('click',(e)=>{
  activeFilters.sale = !activeFilters.sale;
  e.target.classList.toggle('active',activeFilters.sale);
  renderGrid();
});
document.getElementById('sortSelect').addEventListener('change',(e)=>{activeSort=e.target.value;renderGrid();});

// nav category shortcuts
document.querySelectorAll('a[data-cat]').forEach(a=>{
  a.addEventListener('click',(e)=>{
    const cat=a.dataset.cat;
    setTimeout(()=>{
      const map={'Men':'Men','Women':'Women','sale':'sale'};
      const target=map[cat];
      document.querySelectorAll('[data-filter-cat]').forEach(b=>b.classList.toggle('active', b.dataset.filterCat===target));
      if(target==='sale'){activeFilters.cat='sale';activeFilters.sale=true;}
      else {activeFilters.cat=target;activeFilters.sale=false;}
      renderGrid();
    },400);
  });
});

/* ================= ADVANCED FILTER DRAWER ================= */
function buildFilterDrawer(){
  document.getElementById('fdCategory').innerHTML = ['Men','Women','Unisex'].map(c=>`<button class="fd-opt" data-fdcat="${c}">${c}</button>`).join('');
  document.getElementById('fdSize').innerHTML = SIZES.map(s=>`<button class="fd-opt" data-fdsize="${s}">${s}</button>`).join('');
  document.getElementById('fdColor').innerHTML = COLOR_NAMES.map(c=>`<span class="fd-swatch" data-fdcolor="${c}" style="background:${COLORS[c]}" title="${c}"></span>`).join('');
  document.getElementById('fdCollection').innerHTML = COLLECTIONS.map(c=>`<button class="fd-opt" data-fdcoll="${c.id}">${c.name}</button>`).join('');
  document.getElementById('fdRating').innerHTML = [4.5,4,3.5,0].map(r=>`<button class="fd-opt" data-fdrating="${r}">${r===0?'Any':r+'★ & up'}</button>`).join('');

  document.querySelectorAll('[data-fdcat]').forEach(b=>b.addEventListener('click',()=>{b.classList.toggle('active');}));
  document.querySelectorAll('[data-fdsize]').forEach(b=>b.addEventListener('click',()=>{b.classList.toggle('active');}));
  document.querySelectorAll('[data-fdcolor]').forEach(b=>b.addEventListener('click',()=>{b.classList.toggle('active');}));
  document.querySelectorAll('[data-fdcoll]').forEach(b=>b.addEventListener('click',()=>{b.classList.toggle('active');}));
  document.querySelectorAll('[data-fdrating]').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('[data-fdrating]').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
  }));
  document.getElementById('fdAvail').addEventListener('click',(e)=>e.target.classList.toggle('active'));
  document.getElementById('fdPrice').addEventListener('input',(e)=>{document.getElementById('fdPriceVal').textContent='$'+e.target.value;});
}
document.getElementById('btnMoreFilters').addEventListener('click',()=>openDrawer('filter-drawer'));
document.getElementById('btnCloseFilter').addEventListener('click',()=>closeDrawer('filter-drawer'));
document.getElementById('btnClearFilters').addEventListener('click',()=>{
  document.querySelectorAll('#filter-drawer .fd-opt.active,#filter-drawer .fd-swatch.active').forEach(b=>b.classList.remove('active'));
  document.getElementById('fdPrice').value=300;
  document.getElementById('fdPriceVal').textContent='$300';
});
document.getElementById('btnApplyFilters').addEventListener('click',()=>{
  activeFilters.sizes = [...document.querySelectorAll('[data-fdsize].active')].map(b=>b.dataset.fdsize);
  activeFilters.colors = [...document.querySelectorAll('[data-fdcolor].active')].map(b=>b.dataset.fdcolor);
  activeFilters.collections = [...document.querySelectorAll('[data-fdcoll].active')].map(b=>b.dataset.fdcoll);
  const catSel = [...document.querySelectorAll('[data-fdcat].active')].map(b=>b.dataset.fdcat);
  if(catSel.length===1){ activeFilters.cat=catSel[0]; }
  activeFilters.maxPrice = +document.getElementById('fdPrice').value;
  const ratingBtn = document.querySelector('[data-fdrating].active');
  activeFilters.minRating = ratingBtn ? +ratingBtn.dataset.fdrating : 0;
  activeFilters.inStockOnly = document.getElementById('fdAvail').classList.contains('active');
  closeDrawer('filter-drawer');
  renderGrid();
});

/* ================= COLLECTIONS ================= */
function renderCollections(){
  document.getElementById('collectionsWrap').innerHTML = COLLECTIONS.map(c=>`
    <div class="coll-card reveal-up" data-coll="${c.id}">
      <img class="coll-img" src="${c.img}" alt="${c.name} collection" loading="lazy">
      <div class="coll-scrim"></div>
      <div class="coll-body">
        <div>
          <div class="coll-tag">${c.tag}</div>
          <div class="coll-name">${c.name}</div>
        </div>
        <div class="coll-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M7 7h10v10"/></svg></div>
      </div>
    </div>`).join('');
  document.querySelectorAll('.coll-card').forEach(c=>{
    c.addEventListener('click',()=>{
      activeFilters.collections=[c.dataset.coll]; activeFilters.cat='all'; activeFilters.sale=false;
      document.querySelectorAll('[data-filter-cat]').forEach(b=>b.classList.toggle('active',b.dataset.filterCat==='all'));
      renderGrid();
      document.getElementById('shop').scrollIntoView({behavior:'smooth'});
    });
  });
  initRevealObservers();
}

/* ================= WISHLIST ================= */
function toggleWish(id,btnEl){
  const idx=wishlist.indexOf(id);
  if(idx>-1){ wishlist.splice(idx,1); toast('Removed from wishlist'); }
  else { wishlist.push(id); toast('Added to wishlist'); }
  saveWish();
  updateCounts();
  document.querySelectorAll(`[data-wish="${id}"]`).forEach(b=>{
    b.classList.toggle('active', wishlist.includes(id));
    b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse');
  });
  if(currentProduct && currentProduct.id===id) syncPdpWishBtn();
  if(!document.getElementById('page-panel').classList.contains('open')) return;
  if(document.querySelector('.acc-tab.active')?.dataset.tab==='wishlist') renderAccountPanel('wishlist');
}

/* ================= CART ================= */
function addToCart(p,color,size,qty,originEl){
  const key = p.id+'|'+color+'|'+size;
  const existing = cart.find(i=>i.key===key);
  if(existing){ existing.qty += qty; }
  else { cart.push({key,id:p.id,name:p.name,price:p.price,img:p.img1,color,size,qty}); }
  saveCart();
  updateCounts();
  renderCart();
  toast(`${p.name} added to bag`);
  if(originEl) flyToCart(originEl);
}
function removeFromCart(key){
  cart = cart.filter(i=>i.key!==key);
  saveCart(); updateCounts(); renderCart();
}
function changeQty(key,delta){
  const item=cart.find(i=>i.key===key);
  if(!item) return;
  item.qty += delta;
  if(item.qty<=0) return removeFromCart(key);
  saveCart(); updateCounts(); renderCart();
}
function cartTotal(){ return cart.reduce((s,i)=>s+i.price*i.qty,0); }
function updateCounts(){
  const cc=cart.reduce((s,i)=>s+i.qty,0);
  const wc=wishlist.length;
  const cEl=document.getElementById('cartCount'), wEl=document.getElementById('wishCount');
  cEl.textContent=cc; cEl.classList.toggle('show',cc>0);
  wEl.textContent=wc; wEl.classList.toggle('show',wc>0);
}
function renderCart(){
  const body=document.getElementById('cartBody');
  if(!cart.length){
    body.innerHTML=`<div class="cd-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3 6h2l2 12h11l2-8H7"/><circle cx="10" cy="21" r="1"/><circle cx="17" cy="21" r="1"/></svg><p>Your bag is empty.<br>Time to fix that.</p></div>`;
    document.getElementById('cartFoot').style.display='none';
    return;
  }
  document.getElementById('cartFoot').style.display='block';
  body.innerHTML = cart.map(i=>`
    <div class="cd-item">
      <img src="${i.img}" alt="${i.name}">
      <div class="cd-item-info">
        <div class="cd-item-name">${i.name}</div>
        <div class="cd-item-meta">${i.color} · Size ${i.size}</div>
        <div class="cd-item-bottom">
          <div class="qty-ctrl">
            <button data-qty-minus="${i.key}">−</button>
            <span>${i.qty}</span>
            <button data-qty-plus="${i.key}">+</button>
          </div>
          <div class="cd-item-price">${fmt(i.price*i.qty)}</div>
        </div>
        <button class="cd-item-remove" data-remove="${i.key}">Remove</button>
      </div>
    </div>`).join('');
  body.querySelectorAll('[data-qty-plus]').forEach(b=>b.addEventListener('click',()=>changeQty(b.dataset.qtyPlus,1)));
  body.querySelectorAll('[data-qty-minus]').forEach(b=>b.addEventListener('click',()=>changeQty(b.dataset.qtyMinus,-1)));
  body.querySelectorAll('[data-remove]').forEach(b=>b.addEventListener('click',()=>removeFromCart(b.dataset.remove)));
  document.getElementById('cdTotal').textContent = fmt(cartTotal());
}
function flyToCart(originEl){
  const cartBtn=document.getElementById('btnCart');
  const r1=originEl.getBoundingClientRect(), r2=cartBtn.getBoundingClientRect();
  const ghost=document.createElement('div');
  ghost.className='fly-ghost';
  ghost.style.cssText=`left:${r1.left+r1.width/2-14}px;top:${r1.top+r1.height/2-14}px;width:28px;height:28px;background:var(--lime);`;
  document.body.appendChild(ghost);
  requestAnimationFrame(()=>{
    ghost.style.left=(r2.left+r2.width/2-6)+'px';
    ghost.style.top=(r2.top+r2.height/2-6)+'px';
    ghost.style.width='12px'; ghost.style.height='12px'; ghost.style.opacity='0.3';
  });
  setTimeout(()=>{ghost.remove(); cartBtn.style.transform='scale(1.15)'; setTimeout(()=>cartBtn.style.transform='',180);},720);
}

/* ================= DRAWERS / SCRIM ================= */
function openDrawer(id){
  document.getElementById(id).classList.add('open');
  document.getElementById('scrim').classList.add('show');
  document.body.classList.add('lock');
}
function closeDrawer(id){
  document.getElementById(id).classList.remove('open');
  document.getElementById('scrim').classList.remove('show');
  document.body.classList.remove('lock');
}
document.getElementById('scrim').addEventListener('click',()=>{
  ['cart-drawer','filter-drawer'].forEach(closeDrawer);
});
document.getElementById('btnCart').addEventListener('click',()=>{renderCart();openDrawer('cart-drawer');});
document.getElementById('btnCloseCart').addEventListener('click',()=>closeDrawer('cart-drawer'));
document.getElementById('btnCloseCart2').addEventListener('click',()=>closeDrawer('cart-drawer'));
document.getElementById('btnCheckoutFromCart').addEventListener('click',()=>{
  if(!cart.length){toast('Your bag is empty');return;}
  closeDrawer('cart-drawer');
  openCheckout();
});

/* ================= MOBILE NAV ================= */
document.getElementById('btnBurger').addEventListener('click',()=>{document.getElementById('mobile-nav').classList.add('open');document.body.classList.add('lock');});
document.getElementById('btnMnavClose').addEventListener('click',()=>{document.getElementById('mobile-nav').classList.remove('open');document.body.classList.remove('lock');});
document.querySelectorAll('#mobile-nav a').forEach(a=>a.addEventListener('click',()=>{document.getElementById('mobile-nav').classList.remove('open');document.body.classList.remove('lock');}));

/* ================= SEARCH ================= */
const TRENDING_SEARCHES=['Vector Overshirt','Cargo pants','After Dark','Oversized hoodie','Wrap dress'];
function openSearch(){
  document.getElementById('search-overlay').classList.add('open');
  document.body.classList.add('lock');
  document.getElementById('trendingSearches').innerHTML = TRENDING_SEARCHES.map(t=>`<button class="search-tag" data-qsearch="${t}">${t}</button>`).join('');
  document.getElementById('catSearches').innerHTML = ['Men','Women','Unisex','New Era','After Dark','Essentials'].map(t=>`<button class="search-tag" data-qsearch="${t}">${t}</button>`).join('');
  renderRecentSearches();
  setTimeout(()=>document.getElementById('search-input').focus(),350);
  runSearch('');
}
function closeSearch(){
  document.getElementById('search-overlay').classList.remove('open');
  document.body.classList.remove('lock');
}
function renderRecentSearches(){
  const el=document.getElementById('recentSearches');
  if(!recentSearches.length){el.innerHTML='<span class="search-empty">No recent searches yet.</span>';return;}
  el.innerHTML = recentSearches.slice(0,6).map(t=>`<button class="search-tag" data-qsearch="${t}">${t}</button>`).join('');
}
function runSearch(q){
  const label=document.getElementById('resultsLabel');
  const resEl=document.getElementById('searchResults');
  if(!q.trim()){ label.textContent='START TYPING TO SEARCH'; resEl.innerHTML=''; return; }
  const ql=q.toLowerCase();
  const results=PRODUCTS.filter(p=> p.name.toLowerCase().includes(ql) || p.cat.toLowerCase().includes(ql) || p.collection.includes(ql.replace(/\s/g,'-')));
  label.textContent = results.length ? `${results.length} RESULT${results.length===1?'':'S'}` : 'NO RESULTS';
  resEl.innerHTML = results.slice(0,8).map(p=>`
    <div class="sr-item" data-id="${p.id}">
      <img src="${p.img1}" alt="${p.name}">
      <div><div class="sr-item-name">${p.name}</div><div class="sr-item-cat">${p.cat} · ${p.collection.replace('-',' ')}</div></div>
      <div class="sr-item-price">${fmt(p.price)}</div>
    </div>`).join('');
  resEl.querySelectorAll('.sr-item').forEach(el=>el.addEventListener('click',()=>{
    commitSearch(q); closeSearch(); openPDP(el.dataset.id);
  }));
}
function commitSearch(q){
  if(!q.trim()) return;
  recentSearches = [q, ...recentSearches.filter(r=>r.toLowerCase()!==q.toLowerCase())].slice(0,6);
  saveRecent();
}
document.getElementById('btnSearch').addEventListener('click',openSearch);
document.getElementById('btnCloseSearch').addEventListener('click',closeSearch);
document.getElementById('search-input').addEventListener('input',e=>runSearch(e.target.value));
document.getElementById('search-input').addEventListener('keydown',e=>{
  if(e.key==='Enter') commitSearch(e.target.value);
  if(e.key==='Escape') closeSearch();
});
document.addEventListener('click',e=>{
  const qs=e.target.closest('[data-qsearch]');
  if(qs){ document.getElementById('search-input').value=qs.dataset.qsearch; runSearch(qs.dataset.qsearch); }
});

/* ================= PRODUCT DETAIL PAGE ================= */
function openPDP(id){
  const p=findProduct(id);
  if(!p) return;
  currentProduct=p; currentPdpColorIdx=0; currentPdpQty=1; currentPdpImgIdx=0;
  currentPdpSize = p.sizes[Math.min(2,p.sizes.length-1)];
  renderPDP();
  document.getElementById('pdp').classList.add('open');
  document.body.classList.add('lock');
  document.getElementById('pdpContent').scrollTop=0;
  window.scrollTo(0,0);
}
function closePDP(){
  document.getElementById('pdp').classList.remove('open');
  document.body.classList.remove('lock');
}
function syncPdpWishBtn(){
  const active = wishlist.includes(currentProduct.id);
  document.querySelectorAll('#pdpWishBtnTop, #pdpWishBtnMain').forEach(b=>{
    if(b) b.classList.toggle('active',active);
  });
}
function renderPDP(){
  const p=currentProduct;
  const wished=wishlist.includes(p.id);
  document.getElementById('pdpContent').innerHTML = `
    <div class="pdp-gallery">
      <div class="pdp-main-img-wrap" id="pdpMainImgWrap">
        <img class="pdp-main-img" id="pdpMainImg" src="${p.gallery[0]}" alt="${p.name}">
        <div class="pdp-zoom-hint"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/><path d="M11 8v6M8 11h6"/></svg>Click to zoom</div>
      </div>
      <div class="pdp-thumbs" id="pdpThumbs">
        ${p.gallery.map((g,i)=>`<div class="pdp-thumb ${i===0?'active':''}" data-idx="${i}"><img src="${g}" alt="view ${i+1}"></div>`).join('')}
      </div>
    </div>
    <div class="pdp-info">
      <div class="pdp-cat">${p.cat.toUpperCase()} · ${p.collection.replace('-',' ').toUpperCase()}</div>
      <h1 class="pdp-name">${p.name}</h1>
      <div class="pdp-rating-row">
        <div class="pdp-stars">${ratingStars(p.rating)}</div>
        <div class="pdp-rating-text">${p.rating} (${p.reviews} reviews)</div>
      </div>
      <div class="pdp-price-row">
        <span class="pdp-price">${fmt(p.price)}</span>
        ${p.original?`<span class="pdp-price-old">${fmt(p.original)}</span><span class="pdp-discount">−${p.discount}%</span>`:''}
      </div>
      ${p.stock<5?`<div class="pdp-stock"><span class="pulse-dot"></span>Only ${p.stock} left in stock</div>`:''}

      <div class="pdp-section">
        <div class="pdp-label">Color <span class="val" id="pdpColorLabel">${p.colors[0]}</span></div>
        <div class="color-row" id="pdpColorRow">
          ${p.colors.map((c,i)=>`<button class="color-swatch ${i===0?'active':''}" data-color="${c}" data-idx="${i}" style="background:${COLORS[c]}" title="${c}"></button>`).join('')}
        </div>
      </div>

      <div class="pdp-section">
        <div class="pdp-label">Size</div>
        <div class="size-row" id="pdpSizeRow">
          ${SIZES.map(s=>`<button class="size-btn ${!p.sizes.includes(s)?'oos':''} ${s===currentPdpSize?'active':''}" data-size="${s}">${s}</button>`).join('')}
        </div>
        <button class="sizeguide-link" id="btnSizeGuide">View size guide →</button>
      </div>

      <div class="pdp-section">
        <div class="pdp-label">Quantity</div>
        <div class="qty-block">
          <div class="qty-ctrl-lg">
            <button id="pdpQtyMinus">−</button><span id="pdpQtyVal">1</span><button id="pdpQtyPlus">+</button>
          </div>
        </div>
      </div>

      <div class="pdp-actions">
        <button class="btn btn-primary added-flash" id="btnAddToCart" style="flex:1.4">Add to bag — ${fmt(p.price)}</button>
        <button class="btn btn-ghost" id="btnBuyNow">Buy now</button>
        <button class="pdp-wish-btn ${wished?'active':''}" id="pdpWishBtnMain">
          <svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-10-9.3C.6 8 2 4.5 5.4 4A5.4 5.4 0 0 1 12 7a5.4 5.4 0 0 1 6.6-3c3.4.5 4.8 4 3.4 7.7C19.5 16.4 12 21 12 21z"/></svg>
        </button>
      </div>

      <div class="pdp-trust">
        <div class="trust-item"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><rect x="1" y="7" width="15" height="10" rx="1"/><path d="M16 10h3l3 3v4h-6"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></svg>24H shipping</div>
        <div class="trust-item"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><path d="M3 12a9 9 0 1 0 9-9M3 12l3-3M3 12l3 3"/></svg>30-day returns</div>
        <div class="trust-item"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>Secure checkout</div>
      </div>

      <div class="accordion" id="pdpAccordion">
        ${accItem('Description', `<p>${p.desc}</p>`)}
        ${accItem('Material & fabric', specRows([['Fabric',p.fabric],['Material',p.material],['Weight',p.weight]]))}
        ${accItem('Fit & sizing', specRows([['Fit',p.fit],['Recommended','True to size'],['Model is wearing','Size M']]))}
        ${accItem('Care instructions', `<p>Machine wash cold with like colors. Do not bleach. Tumble dry low. Warm iron if needed. Do not dry clean.</p>`)}
        ${accItem('Shipping information', `<p>Free 24-hour shipping on all orders. Express and standard windows available at checkout. Carbon-neutral delivery on every order.</p>`)}
        ${accItem('Returns & exchange', `<p>Free returns within 30 days of delivery. Items must be unworn with tags attached. Exchanges processed within 48 hours of receipt.</p>`)}
        ${accItem('Product details', specRows([['Style code',p.id.toUpperCase()+'-'+p.collection.slice(0,3).toUpperCase()],['Collection',p.collection.replace('-',' ')],['Category',p.cat]]))}
      </div>
    </div>
  `;
  bindPdpEvents();
}
function accItem(title,bodyHtml){
  return `<div class="acc-item">
    <button class="acc-head">${title}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></button>
    <div class="acc-body"><div class="acc-body-in">${bodyHtml}</div></div>
  </div>`;
}
function specRows(pairs){ return `<div>${pairs.map(([k,v])=>`<div class="spec-row"><span>${k}</span><span>${v}</span></div>`).join('')}</div>`; }

function bindPdpEvents(){
  const p=currentProduct;
  document.querySelectorAll('#pdpColorRow .color-swatch').forEach(b=>{
    b.addEventListener('click',()=>{
      document.querySelectorAll('#pdpColorRow .color-swatch').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      document.getElementById('pdpColorLabel').textContent=b.dataset.color;
    });
  });
  document.querySelectorAll('#pdpSizeRow .size-btn').forEach(b=>{
    if(b.classList.contains('oos')) return;
    b.addEventListener('click',()=>{
      document.querySelectorAll('#pdpSizeRow .size-btn').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      currentPdpSize=b.dataset.size;
    });
  });
  document.getElementById('pdpQtyPlus').addEventListener('click',()=>{
    currentPdpQty++; document.getElementById('pdpQtyVal').textContent=currentPdpQty;
  });
  document.getElementById('pdpQtyMinus').addEventListener('click',()=>{
    if(currentPdpQty<=1) return;
    currentPdpQty--; document.getElementById('pdpQtyVal').textContent=currentPdpQty;
  });
  document.getElementById('btnAddToCart').addEventListener('click',(e)=>{
    const color=document.querySelector('#pdpColorRow .color-swatch.active').dataset.color;
    addToCart(p,color,currentPdpSize,currentPdpQty,document.getElementById('pdpMainImg'));
    e.currentTarget.classList.remove('show'); void e.currentTarget.offsetWidth; e.currentTarget.classList.add('show');
  });
  document.getElementById('btnBuyNow').addEventListener('click',()=>{
    const color=document.querySelector('#pdpColorRow .color-swatch.active').dataset.color;
    addToCart(p,color,currentPdpSize,currentPdpQty,null);
    closePDP();
    openCheckout();
  });
  [document.getElementById('pdpWishBtnMain'),document.getElementById('pdpWishBtnTop')].forEach(b=>{
    if(b) b.addEventListener('click',()=>toggleWish(p.id,b));
  });
  document.getElementById('pdpCartBtnTop').addEventListener('click',()=>{renderCart();openDrawer('cart-drawer');});
  document.querySelectorAll('#pdpThumbs .pdp-thumb').forEach(t=>{
    t.addEventListener('click',()=>{
      document.querySelectorAll('#pdpThumbs .pdp-thumb').forEach(x=>x.classList.remove('active'));
      t.classList.add('active');
      currentPdpImgIdx=+t.dataset.idx;
      document.getElementById('pdpMainImg').src=p.gallery[currentPdpImgIdx];
    });
  });
  document.getElementById('pdpMainImgWrap').addEventListener('click',()=>openZoom(currentPdpImgIdx));
  document.querySelectorAll('#pdpAccordion .acc-head').forEach(h=>{
    h.addEventListener('click',()=>h.closest('.acc-item').classList.toggle('open'));
  });
  document.getElementById('btnSizeGuide').addEventListener('click',()=>openModal('sizeGuideModal'));
}
document.getElementById('btnClosePdp').addEventListener('click',closePDP);

/* ================= ZOOM VIEWER ================= */
function openZoom(idx){
  document.getElementById('zoomImg').src=currentProduct.gallery[idx];
  document.getElementById('zoom-viewer').classList.add('open');
  document.getElementById('zoom-viewer').dataset.idx=idx;
}
function closeZoom(){document.getElementById('zoom-viewer').classList.remove('open');}
document.getElementById('btnCloseZoom').addEventListener('click',closeZoom);
document.getElementById('zoomPrev').addEventListener('click',()=>{
  let i=+document.getElementById('zoom-viewer').dataset.idx; i=(i-1+currentProduct.gallery.length)%currentProduct.gallery.length; openZoom(i);
});
document.getElementById('zoomNext').addEventListener('click',()=>{
  let i=+document.getElementById('zoom-viewer').dataset.idx; i=(i+1)%currentProduct.gallery.length; openZoom(i);
});

/* ================= SIZE GUIDE MODAL ================= */
function buildSizeTable(){
  document.getElementById('sizeTableBody').innerHTML = SIZE_TABLE.map(r=>`<tr><td>${r.size}</td><td>${r.chest}"</td><td>${r.length}"</td><td>${r.shoulder}"</td><td>${r.waist}"</td></tr>`).join('');
}
function openModal(id){document.getElementById(id).classList.add('open');document.getElementById('scrim').classList.add('show');}
function closeModal(id){document.getElementById(id).classList.remove('open');document.getElementById('scrim').classList.remove('show');}
document.getElementById('btnCloseSizeGuide').addEventListener('click',()=>closeModal('sizeGuideModal'));

/* ================= CHECKOUT ================= */
function openCheckout(){
  goToStep(1);
  renderCheckoutSummary();
  document.getElementById('checkout').classList.add('open');
  document.body.classList.add('lock');
}
function closeCheckout(){
  document.getElementById('checkout').classList.remove('open');
  document.body.classList.remove('lock');
}
function goToStep(step){
  document.querySelectorAll('.co-panel').forEach(p=>p.classList.toggle('active', p.dataset.panel==String(step)));
  document.querySelectorAll('.co-step').forEach(s=>{
    const n=+s.dataset.step;
    s.classList.toggle('active', n===step);
    s.classList.toggle('done', n<step);
  });
  if(step==='success'){ document.querySelector('.co-steps').style.opacity='0.3'; }
  window.scrollTo(0,0);
  if(step===4) renderReview();
}
document.querySelectorAll('[data-next]').forEach(btn=>{
  btn.addEventListener('click',()=>goToStep(btn.dataset.next==='success'?'success':+btn.dataset.next));
});
document.querySelectorAll('.pay-method').forEach(m=>{
  m.addEventListener('click',()=>{
    document.querySelectorAll('.pay-method').forEach(x=>x.classList.remove('active'));
    m.classList.add('active');
    document.getElementById('cardFields').style.display = m.dataset.pay==='card' ? 'block':'none';
  });
});
function renderCheckoutSummary(){
  const el=document.getElementById('checkoutSummary');
  const subtotal=cartTotal();
  el.innerHTML = `
    <div style="font-family:var(--font-d);font-weight:600;margin-bottom:16px;font-size:16px">Order summary</div>
    ${cart.map(i=>`<div class="co-summary-item"><img src="${i.img}" alt="${i.name}"><div class="co-summary-item-info"><div class="n">${i.name} × ${i.qty}</div><div class="m">${i.color} · Size ${i.size}</div></div><div style="font-size:12.5px;font-weight:600">${fmt(i.price*i.qty)}</div></div>`).join('')}
    <div class="co-summary-row"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
    <div class="co-summary-row"><span>Shipping</span><span>Free</span></div>
    <div class="co-summary-row"><span>Estimated tax</span><span>${fmt(subtotal*0.08)}</span></div>
    <div class="co-summary-row total"><span>Total</span><span>${fmt(subtotal*1.08)}</span></div>
  `;
}
function renderReview(){
  const first=document.getElementById('coFirst').value||'—', last=document.getElementById('coLast').value||'';
  const email=document.getElementById('coEmail').value||'—';
  const addr=document.getElementById('coAddr').value||'—', city=document.getElementById('coCity').value||'', state=document.getElementById('coState').value||'';
  const pay=document.querySelector('.pay-method.active .pay-radio')?.parentElement.querySelector('div>div').textContent||'Card';
  document.getElementById('reviewBlock').innerHTML = `
    <div><strong style="color:var(--ink)">Contact:</strong> ${first} ${last} · ${email}</div>
    <div><strong style="color:var(--ink)">Delivery:</strong> ${addr}, ${city} ${state}</div>
    <div><strong style="color:var(--ink)">Payment:</strong> ${document.querySelector('.pay-method.active > div:last-child > div').textContent}</div>
  `;
}
document.getElementById('btnPlaceOrder').addEventListener('click',()=>{
  const orderNum='TF-'+Math.floor(100000+Math.random()*899999);
  document.getElementById('orderNum').textContent='#'+orderNum;
  cart=[]; saveCart(); updateCounts(); renderCart();
  goToStep('success');
});
document.getElementById('btnBackToShop').addEventListener('click',()=>{
  closeCheckout();
  document.getElementById('shop').scrollIntoView({behavior:'smooth'});
});
document.getElementById('btnCloseCheckout').addEventListener('click',closeCheckout);

/* ================= ACCOUNT / WISHLIST PAGE ================= */
const ORDERS=[
  {num:'TF-204819',date:'Aug 28, 2026',status:'transit',total:186.4,items:[0,3]},
  {num:'TF-198220',date:'Aug 11, 2026',status:'delivered',total:94.0,items:[5]},
  {num:'TF-190113',date:'Jul 30, 2026',status:'delivered',total:248.6,items:[7,9,2]},
  {num:'TF-183399',date:'Jul 14, 2026',status:'processing',total:62.0,items:[1]},
];
function openPagePanel(view){
  renderAccountPanel(view);
  document.getElementById('page-panel').classList.add('open');
  document.body.classList.add('lock');
}
function closePagePanel(){
  document.getElementById('page-panel').classList.remove('open');
  document.body.classList.remove('lock');
}
document.getElementById('btnClosePagePanel').addEventListener('click',closePagePanel);
document.getElementById('btnAccount').addEventListener('click',()=>openPagePanel('orders'));
document.getElementById('btnWishlist').addEventListener('click',()=>openPagePanel('wishlist'));

function renderAccountPanel(tab){
  const body=document.getElementById('pageBody');
  body.innerHTML = `
    <h1 class="section-title" style="margin-bottom:30px">Your account</h1>
    <div class="acc-tabs">
      <button class="acc-tab" data-tab="orders">Orders</button>
      <button class="acc-tab" data-tab="wishlist">Wishlist</button>
      <button class="acc-tab" data-tab="addresses">Saved addresses</button>
      <button class="acc-tab" data-tab="profile">Profile</button>
      <button class="acc-tab" data-tab="settings">Settings</button>
    </div>
    <div class="acc-panel" data-panel="orders">${ordersHTML()}</div>
    <div class="acc-panel" data-panel="wishlist">${wishlistHTML()}</div>
    <div class="acc-panel" data-panel="addresses">${addressesHTML()}</div>
    <div class="acc-panel" data-panel="profile">${profileHTML()}</div>
    <div class="acc-panel" data-panel="settings">${settingsHTML()}</div>
  `;
  body.querySelectorAll('.acc-tab').forEach(t=>{
    t.classList.toggle('active', t.dataset.tab===tab);
    t.addEventListener('click',()=>{
      body.querySelectorAll('.acc-tab').forEach(x=>x.classList.remove('active'));
      body.querySelectorAll('.acc-panel').forEach(x=>x.classList.remove('active'));
      t.classList.add('active');
      body.querySelector(`.acc-panel[data-panel="${t.dataset.tab}"]`).classList.add('active');
    });
  });
  body.querySelector(`.acc-panel[data-panel="${tab}"]`).classList.add('active');
  bindWishGridEvents();
  bindSettingsToggles();
}
function ordersHTML(){
  return ORDERS.map(o=>{
    const prods=o.items.map(i=>PRODUCTS[i]).filter(Boolean);
    return `<div class="order-card">
      <div style="display:flex;gap:16px;align-items:center">
        <div class="order-imgs">${prods.map(p=>`<img src="${p.img1}" alt="${p.name}">`).join('')}</div>
        <div class="order-info"><div class="num">${o.num}</div><div class="date">${o.date} · ${prods.length} item${prods.length===1?'':'s'}</div></div>
      </div>
      <div style="display:flex;align-items:center;gap:18px">
        <span class="order-status ${o.status}">${o.status==='transit'?'IN TRANSIT':o.status.toUpperCase()}</span>
        <span class="order-total">${fmt(o.total)}</span>
      </div>
    </div>`;
  }).join('');
}
function wishlistHTML(){
  if(!wishlist.length) return `<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 21s-7.5-4.6-10-9.3C.6 8 2 4.5 5.4 4A5.4 5.4 0 0 1 12 7a5.4 5.4 0 0 1 6.6-3c3.4.5 4.8 4 3.4 7.7C19.5 16.4 12 21 12 21z"/></svg><p>Nothing saved yet. Tap the heart on any piece to save it here.</p></div>`;
  const items=wishlist.map(findProduct).filter(Boolean);
  return `<div class="wish-grid">${items.map(p=>productCardHTML(p,'')).join('')}</div>`;
}
function addressesHTML(){
  return `
    <div class="addr-card"><span class="tag">DEFAULT</span><div style="font-weight:600;margin-bottom:4px">Home</div><div style="font-size:13px;color:var(--ink-dim)">120 Fabric Lane, New York, NY 10001, United States</div></div>
    <div class="addr-card"><div style="font-weight:600;margin-bottom:4px">Studio</div><div style="font-size:13px;color:var(--ink-dim)">44 Grid Avenue, Brooklyn, NY 11201, United States</div></div>
    <button class="btn btn-ghost" style="margin-top:8px">+ Add new address</button>
  `;
}
function profileHTML(){
  return `<div class="profile-grid">
    <div class="form-field"><label>First name</label><input type="text" value="Alex"></div>
    <div class="form-field"><label>Last name</label><input type="text" value="Chen"></div>
    <div class="form-field" style="grid-column:1/-1"><label>Email</label><input type="email" value="alex@email.com"></div>
    <div class="form-field" style="grid-column:1/-1"><label>Phone</label><input type="tel" value="+1 (555) 000-0000"></div>
  </div>
  <button class="btn btn-primary" style="margin-top:22px">Save changes</button>`;
}
function settingsHTML(){
  return `
    <div class="settings-row"><div><div class="settings-row-t">Order updates</div><div class="settings-row-d">Email me about shipping and delivery status</div></div><div class="toggle on" data-toggle></div></div>
    <div class="settings-row"><div><div class="settings-row-t">New drops</div><div class="settings-row-d">Be first to know when a collection launches</div></div><div class="toggle on" data-toggle></div></div>
    <div class="settings-row"><div><div class="settings-row-t">Price drop alerts</div><div class="settings-row-d">Notify me when wishlist items go on sale</div></div><div class="toggle" data-toggle></div></div>
    <div class="settings-row"><div><div class="settings-row-t">SMS notifications</div><div class="settings-row-d">Delivery texts for active orders</div></div><div class="toggle" data-toggle></div></div>
  `;
}
function bindWishGridEvents(){
  document.querySelectorAll('.wish-grid .pcard-frame').forEach(el=>{
    el.addEventListener('click',(e)=>{
      if(e.target.closest('[data-wish],[data-quickadd]')) return;
      closePagePanel();
      openPDP(el.closest('.pcard').dataset.id);
    });
  });
  document.querySelectorAll('.wish-grid [data-wish]').forEach(btn=>{
    btn.addEventListener('click',(e)=>{e.stopPropagation();toggleWish(btn.dataset.wish,btn);});
  });
  document.querySelectorAll('.wish-grid [data-quickadd]').forEach(btn=>{
    btn.addEventListener('click',(e)=>{
      e.stopPropagation();
      const p=findProduct(btn.dataset.quickadd);
      addToCart(p, p.colors[0], p.sizes[Math.min(2,p.sizes.length-1)], 1, e.target);
    });
  });
}
function bindSettingsToggles(){
  document.querySelectorAll('[data-toggle]').forEach(t=>t.addEventListener('click',()=>t.classList.toggle('on')));
}

/* ================= GLOBAL KEY / SCRIM HANDLERS ================= */
document.addEventListener('keydown',e=>{
  if(e.key!=='Escape') return;
  closeSearch(); closePDP(); closeZoom(); closeModal('sizeGuideModal');
  closeDrawer('cart-drawer'); closeDrawer('filter-drawer'); closeCheckout(); closePagePanel();
});
document.getElementById('zoom-viewer').addEventListener('click',e=>{ if(e.target.id==='zoom-viewer') closeZoom(); });
document.getElementById('sizeGuideModal').parentElement; // noop guard
document.addEventListener('click',e=>{
  if(e.target.id==='scrim'){ closeModal('sizeGuideModal'); }
});

/* smooth-scroll for on-page anchors, closing overlays first */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const id=a.getAttribute('href').slice(1);
    const target=document.getElementById(id);
    if(target){
      e.preventDefault();
      closePDP(); closeCheckout(); closePagePanel();
      setTimeout(()=>target.scrollIntoView({behavior:'smooth'}),50);
    }
  });
});

/* ================= INIT ================= */
function init(){
  renderTrending();
  renderGrid();
  renderCollections();
  buildFilterDrawer();
  buildSizeTable();
  updateCounts();
  renderCart();
}
init();

})();