/* ═══════════════════════════════════════════════════════════
   NEUROBARD — Dynamic News Feed
   RSS via rss2json, 4h cache, curated fallbacks
═══════════════════════════════════════════════════════════ */
(function(){
'use strict';

const RSS_SOURCES = {
  'neurotech': ['https://news.google.com/rss/search?q=neurotech+brain+computer+interface+neuralink&hl=en-US&gl=US&ceid=US:en'],
  'clinical neurology': ['https://news.google.com/rss/search?q=neurology+neurosurgery+treatment+brain&hl=en-US&gl=US&ceid=US:en'],
  'ai neural': ['https://news.google.com/rss/search?q=neural+network+deep+learning+brain+AI&hl=en-US&gl=US&ceid=US:en'],
  'cognitive': ['https://news.google.com/rss/search?q=cognitive+science+neuroplasticity+brain+health&hl=en-US&gl=US&ceid=US:en'],
  'neurogenetics': ['https://news.google.com/rss/search?q=neurogenetics+gene+therapy+brain+CRISPR&hl=en-US&gl=US&ceid=US:en'],
  'neurotech investment': ['https://news.google.com/rss/search?q=neurotech+investment+funding+startup+brain&hl=en-US&gl=US&ceid=US:en'],
  'neuroscience': ['https://news.google.com/rss/search?q=neuroscience+research+discovery+brain&hl=en-US&gl=US&ceid=US:en'],
  'default': ['https://news.google.com/rss/search?q=neuroscience+neurotechnology+brain+AI&hl=en-US&gl=US&ceid=US:en'],
};

const FALLBACK_NEWS = {
  'neurotech': [
    {title:'Neuralink Expands Clinical Trials for Brain-Computer Interface',source:'Reuters',url:'https://www.reuters.com/technology/',date:'Recent'},
    {title:'Synchron BCI Receives Expanded FDA Clearance for Motor Recovery',source:'STAT News',url:'https://www.statnews.com/topic/neuroscience/',date:'Recent'},
    {title:'Paradromics Closes Major Investment Round for High-Bandwidth BCI',source:'TechCrunch',url:'https://techcrunch.com/tag/brain-computer-interface/',date:'Recent'},
    {title:'Consumer EEG Headsets Market Surges to $2B as Wellness Adoption Grows',source:'Wired',url:'https://www.wired.com/tag/neuroscience/',date:'Recent'},
    {title:'UK Announces $84M Precision Neurotechnologies Research Initiative',source:'Nature',url:'https://www.nature.com/subjects/neurotechnology',date:'Recent'},
  ],
  'clinical neurology': [
    {title:'Deep Brain Stimulation Advances Show Promise for Treatment-Resistant Depression',source:'NEJM',url:'https://www.nejm.org/',date:'Recent'},
    {title:'New Alzheimer Drug Demonstrates Significant Cognitive Slowing in Phase III',source:'The Lancet',url:'https://www.thelancet.com/neurology',date:'Recent'},
    {title:'Closed-Loop Spinal Cord Stimulators Achieve 84% Pain Reduction at 12 Months',source:'Medtronic',url:'https://news.medtronic.com/',date:'Recent'},
    {title:'Robotic-Assisted Neurosurgery Reduces Procedure Times by 40%',source:'Neurosurgery Today',url:'https://journals.lww.com/neurosurgery/',date:'Recent'},
    {title:'Gene Therapy for Parkinson Enters Late-Stage Clinical Trials',source:'BioPharma Dive',url:'https://www.biopharmadive.com/',date:'Recent'},
  ],
  'ai neural': [
    {title:'Brain-Inspired Architectures Challenge Traditional Deep Learning Approaches',source:'MIT Technology Review',url:'https://www.technologyreview.com/',date:'Recent'},
    {title:'Neuromorphic Chips Achieve 100x Energy Efficiency Gains',source:'IEEE Spectrum',url:'https://spectrum.ieee.org/',date:'Recent'},
    {title:'Large Language Models Show Structural Parallels to Cortical Processing',source:'Nature Neuroscience',url:'https://www.nature.com/neuro/',date:'Recent'},
    {title:'AI-Powered Neural Signal Decoding Achieves Real-Time Speech Translation',source:'Science',url:'https://www.science.org/',date:'Recent'},
    {title:'Computational Neuroscience Models Improve Drug Target Identification',source:'Cell',url:'https://www.cell.com/neuron/',date:'Recent'},
  ],
  'default': [
    {title:'Global Neurotechnology Market Projected to Reach $53B by 2034',source:'Precedence Research',url:'https://www.precedenceresearch.com/',date:'Recent'},
    {title:'Brain-Computer Interfaces: The Fastest Growing Segment in Neurotech',source:'Mordor Intelligence',url:'https://www.mordorintelligence.com/',date:'Recent'},
    {title:'Consumer Neurotech Firms Now Represent 60% of Global Landscape',source:'Centre for Future Generations',url:'https://cfg.eu/',date:'Recent'},
    {title:'AI Integration in Neurotechnology Demand Surges 48% Year-Over-Year',source:'Global Growth Insights',url:'https://www.globalgrowthinsights.com/',date:'Recent'},
    {title:'BRAIN Initiative Enters New Phase with Expanded Funding and Goals',source:'NIH',url:'https://braininitiative.nih.gov/',date:'Recent'},
  ],
};

const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json';
const CACHE_KEY_PREFIX = 'nb_news_';
const CACHE_DURATION = 4 * 60 * 60 * 1000;

function getBestTopic(str){
  const w = str.toLowerCase();
  for(const key of Object.keys(RSS_SOURCES).filter(k=>k!=='default')){
    if(key.split(' ').some(k=>w.includes(k))) return key;
  }
  return 'default';
}

function getCached(topic){
  try{
    const c = localStorage.getItem(CACHE_KEY_PREFIX+topic);
    if(!c) return null;
    const d = JSON.parse(c);
    if(Date.now()-d.timestamp > CACHE_DURATION) return null;
    return d.items;
  } catch{ return null; }
}

function setCache(topic, items){
  try{ localStorage.setItem(CACHE_KEY_PREFIX+topic, JSON.stringify({timestamp:Date.now(),items})); } catch{}
}

async function fetchRSS(topic){
  const sources = RSS_SOURCES[topic] || RSS_SOURCES['default'];
  try{
    const resp = await fetch(`${RSS2JSON_API}?rss_url=${encodeURIComponent(sources[0])}&count=6`);
    if(!resp.ok) throw new Error('fail');
    const data = await resp.json();
    if(data.status!=='ok' || !data.items?.length) throw new Error('empty');
    return data.items.slice(0,5).map(item=>({
      title: item.title.replace(/\s*[-\u2013\u2014|]\s*[^-\u2013\u2014|]+$/,'').trim().substring(0,120),
      source: item.author || (() => { try{ return new URL(item.link).hostname.replace('www.','').split('.')[0]; } catch{ return 'Source'; }})(),
      url: item.link,
      date: formatDate(item.pubDate),
      thumbnail: item.thumbnail || item.enclosure?.link || null,
    }));
  } catch{ return null; }
}

function formatDate(str){
  if(!str) return 'Recent';
  const d = new Date(str), h = Math.floor((Date.now()-d)/(1000*60*60));
  if(h<1) return 'Just now';
  if(h<24) return h+'h ago';
  if(h<48) return 'Yesterday';
  if(h<168) return Math.floor(h/24)+'d ago';
  return d.toLocaleDateString('en-US',{month:'short',day:'numeric'});
}

function render(container, items){
  const ts = container.closest('.news-feed')?.querySelector('.news-timestamp');
  if(ts) ts.textContent = 'Updated ' + new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
  container.innerHTML = items.map(item => `
    <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="news-item">
      ${item.thumbnail ? `<img src="${item.thumbnail}" alt="" class="news-item-thumb" loading="lazy" onerror="this.style.display='none'">` : ''}
      <div>
        <h4>${item.title}</h4>
        <div class="news-item-meta">${item.source} &middot; ${item.date}</div>
      </div>
    </a>`).join('');
}

async function initFeed(el){
  const topic = getBestTopic(el.getAttribute('data-topic')||'');
  const content = el.querySelector('.news-content') || el.lastElementChild;
  if(!content) return;

  const cached = getCached(topic);
  if(cached){ render(content, cached); return; }

  const live = await fetchRSS(topic);
  if(live?.length){ setCache(topic, live); render(content, live); return; }

  render(content, FALLBACK_NEWS[topic] || FALLBACK_NEWS['default']);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.news-feed[data-topic]').forEach(f => initFeed(f));
  setInterval(() => {
    document.querySelectorAll('.news-feed[data-topic]').forEach(f => {
      const topic = getBestTopic(f.getAttribute('data-topic')||'');
      try{ localStorage.removeItem(CACHE_KEY_PREFIX+topic); } catch{}
      initFeed(f);
    });
  }, CACHE_DURATION);
});

})();
