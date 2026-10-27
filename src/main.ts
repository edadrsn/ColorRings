import {navigationIcon} from './navigation-icon.ts';
import {MenuHistory} from './menu-history.ts';
import {iconArt} from './ui-art.ts';
import {homeMarkup} from './home-view.ts';
import {presentationTheme,PALETTE_BACKDROPS} from './visual-theme.ts';
import {palettePreview} from './palette-preview.ts';
import {skinDetailMarkup,dailyMarkup} from './menu-views.ts';
import {LiveTutorial} from './live-tutorial.ts';
import {StoreController} from './store-controller.ts';
import {InterstitialSchedule} from './ads.ts';
import {buyPalette,applyExtraHint,ECONOMY} from './economy.ts';
import type {CollectionFilter} from './menu-views.ts';
import {PALETTES,paletteById,paletteColors,type PaletteId} from './palettes.ts';
import Phaser from 'phaser';
import './style.css';
import './visual-system.css';
import {RingSession} from './engine.ts';
import {RingsScene} from './scene.ts';
import {BOARD,LEVELS,angularDistance,type Level} from './levels.ts';
import {loadProgress,saveProgress,awardCompletion,buySkin,equipSkin,buyTheme,SAVE_KEY,type StorageLike} from './progress.ts';
import {SKINS,type SkinId} from './cosmetics.ts';
import {getVerifiedHint,type VerifiedHint} from './hints.ts';
import {lessonForLevel,type TutorialLesson,type TutorialEvent} from './tutorial.ts';
import {THEMES,themeById,type ThemeId} from './themes.ts';
import {CHALLENGES,LIVE_LEVELS,LAB_LEVELS,dailyLevel,localDateKey,type GameMode} from './modes.ts';
import {isLevelUnlocked,awardPerfect,awardChallenge,awardDaily,dailyStreak,claimAchievements} from './meta.ts';
import {starRating,rotationDelta} from './presentation.ts';
import {FeedbackAudio} from './audio.ts';
import {SolutionRecording} from './playback.ts';
import {liveRate} from './clock.ts';
import {recordVictory,liveScore} from './statistics.ts';
import {objectiveText,stageProgress} from './objectives.ts';
import {levelsMarkup,collectionMarkup,achievementsMarkup,statisticsMarkup} from './menu-views.ts';

const icons={settings:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 3-.5 2-2 .9-1.9-.6-2.5 4.3 1.5 1.4v2L2.6 14l2.5 4.3 1.9-.6 2 .9.5 2h5l.5-2 2-.9 1.9.6 2.5-4.3-1.5-1.4v-2L21.4 9l-2.5-4.3-1.9.6-2-.9-.5-2z"/><circle cx="12" cy="11.5" r="3.2"/></svg>',undo:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5 3 10l5 5M4 10h9a7 7 0 0 1 0 14" transform="translate(0 -3)"/></svg>',restart:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.8 10A8 8 0 1 0 20 15M20 4v6h-6"/></svg>',hint:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 15c0-3-3-3-3-7a7 7 0 0 1 14 0c0 4-3 4-3 7M8 17h8M9 20h6M10 23h4"/></svg>'};
document.querySelector<HTMLDivElement>('#app')!.innerHTML=`<main class="game-shell">
<header class="hud"><button id="settings" class="round-button" aria-label="Ayarlar">${icons.settings}</button><button id="levels" class="level-badge" aria-label="Bölümleri aç"><span>LEVEL ▦</span><strong id="level-number">01</strong></button><button id="shop" class="coins" aria-label="Mağazayı aç"><i>✦</i><b id="coins">0</b><span>›</span></button></header>
<section class="title"><h1>Color Rings<span>✧</span></h1><div class="title-line"><span id="level-name">İlk dönüş</span><span id="campaign-progress" class="campaign-progress">0 / 20</span><span id="live-indicator" hidden>● CANLI</span></div></section>
<section id="tutorial" class="tutorial-card" role="region" aria-label="Oynanış öğreticisi" hidden><span id="tutorial-step" class="tutorial-step"></span><p id="tutorial-message" aria-live="polite"></p><button id="skip-tutorial" aria-label="Bu öğreticiyi atla">Atla</button></section>
<section class="arena" aria-label="Dönen dairesel labirent"><div id="game"></div><div id="result" class="overlay" hidden><div class="victory-confetti" aria-hidden="true">${Array.from({length:18},(_,i)=>`<i style="--x:${8+(i*17)%84}%;--delay:${i*.045}s;--r:${i*47}deg;--c:${['#f574c6','#68caff','#ffd578','#b69ae3'][i%4]}"></i>`).join('')}</div><section class="dialog result-card" role="dialog" aria-modal="true" aria-labelledby="result-title"><div id="result-icon" class="result-icon">↶</div><div id="result-stars" class="stars" role="img" aria-label="3 yıldız" hidden><span>★</span><span>★</span><span>★</span></div><p id="result-kicker" class="eyebrow"></p><h2 id="result-title"></h2><p id="result-description"></p><span id="reward" class="reward" hidden></span><button id="next" class="play-button" aria-label="Next Level — sonraki bölüm" hidden>Next Level <span>→</span></button><button id="retry" class="play-button"></button></section></div></section>
<p id="status" class="status" role="status" aria-live="polite">Halkaları sürükle.</p>
<div class="controls"><button id="undo" class="utility" aria-label="Undo — son hareketi geri al" disabled>${icons.undo}<small>Undo</small></button><button id="restart" class="utility" aria-label="Restart — yeniden başlat">${icons.restart}<small>Restart</small></button><button id="hint" class="utility" aria-label="İpucu al">${icons.hint}<small>İpucu</small></button><button id="play" class="play-button" disabled><span>▶</span> Play</button></div>
<div id="menu" class="settings-overlay" hidden><section class="dialog menu-dialog" role="dialog" aria-modal="true" aria-labelledby="menu-title"><header class="menu-header"><h2 id="menu-title"></h2><button id="close-menu" aria-label="Menüyü kapat">${navigationIcon('close')}</button></header><div id="menu-content"></div></section></div></main>`;
const $=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
$('game').insertAdjacentHTML('afterend','<button id="preview-toggle" class="preview-toggle" aria-label="Kısa hareket önizlemesi" aria-pressed="true"><span aria-hidden="true">↘</span> Yön izi</button>');
$('settings').insertAdjacentHTML('afterend',`<button id="home" class="round-button" aria-label="Ana menü">${navigationIcon('home')}</button>`);
$('game').insertAdjacentHTML('afterend','<button id="pause" class="preview-toggle pause-toggle" aria-label="Duraklat" hidden>Ⅱ</button>');
$('game').insertAdjacentHTML('afterend','<button id="speed" class="preview-toggle" aria-label="Simülasyon hızı" hidden>1×</button><button id="replay-stop" class="preview-toggle replay-stop" hidden>■ Tekrarı durdur</button>');
$('next').insertAdjacentHTML('afterend','<button id="replay-solution" class="secondary-button" hidden>Replay Solution · Tekrar izle</button>');
document.querySelector('.title')!.insertAdjacentHTML('afterend','<p id="objective" class="objective-card" role="status"></p>');
$('result-stars').insertAdjacentHTML('beforebegin','<div id="perfect-flow" class="perfect-flow" hidden></div>');
$('menu-title').insertAdjacentHTML('beforebegin',`<button id="menu-back" aria-label="Geri — önceki ekran">${navigationIcon('back')}</button>`);
document.querySelector('.game-shell')!.insertAdjacentHTML('beforeend','<p id="toast" class="toast" role="status" hidden></p><div id="theme-preview-bar" class="theme-preview-bar" hidden><span>Tema önizlemesi</span><button id="end-theme-preview">Geri dön</button></div>');
let storage:StorageLike|null=null;try{storage=localStorage;}catch{}
const sandbox=new URLSearchParams(location.search).get('sandbox')==='1';if(sandbox&&storage){const original=storage;storage={getItem:key=>original.getItem('spin-sort-sandbox:'+key),setItem:(key,value)=>original.setItem('spin-sort-sandbox:'+key,value)};}if(sandbox){const badge=document.createElement('p');badge.className='sandbox-banner';badge.textContent='TEST PROFİLİ · Asıl ilerleme kaydın korunuyor';document.querySelector('.game-shell')!.prepend(badge);}
const save=loadProgress(storage),session=new RingSession();session.selectLevel(save.currentLevel-1);
let ready=false,scene:RingsScene,selectedRing=0,currentHint:VerifiedHint|null=null,lastFocus:HTMLElement|null=null;
let lesson:TutorialLesson|null=null,gestureMoves=0;let liveLesson:LiveTutorial|null=null;
let mode:GameMode='normal',modeId=0,dailyKey=localDateKey(),userPaused=false,toastTimer:ReturnType<typeof setTimeout>;
let previewHadResult=false;
let levelView:'classic'|'mastery'=session.level.mastery?'mastery':'classic';
let isReplaying=false,currentRecording:SolutionRecording|null=null,successfulRecording:SolutionRecording|null=null;
let planningGestures:{from:number[];to:number[]}[]=[],gestureStart:number[]=[],attemptSeconds=0,timeSinceSave=0;
let sessionSpeed:1|2=save.speed,missionLevel:Level|null=null;
let lastRotationSound=0,lastAward=0;
const feedback=new FeedbackAudio();
const menuHistory=new MenuHistory();let menuRevision=0;
let collectionFilter:CollectionFilter='all';
const adSchedule=new InterstitialSchedule(performance.now()/1000);
const store=new StoreController(save,storage,{root:$('menu-content'),open:openMenu,back:backMenu,preview:id=>scene.skinPreview(id),changed:()=>{settleAchievements();const saved=persist();configureEffects();scene.setSkin(save.skin);updateUI();return saved;},balls:showShop,themes:()=>showThemes(),palettes:()=>showPalettes()});
function applyTheme(id:ThemeId){document.documentElement.dataset.theme=id;const visual=presentationTheme(id,save.palette);document.documentElement.dataset.palette=save.palette;const palette=themeById(visual);document.documentElement.dataset.theme=visual;const environment=PALETTE_BACKDROPS[save.palette];document.documentElement.style.setProperty('--palette-top',environment.top);document.documentElement.style.setProperty('--palette-bottom',environment.bottom);document.documentElement.dataset.themeTone=palette.dark?'dark':'light';document.documentElement.style.setProperty('--theme-bg',palette.background);document.documentElement.style.setProperty('--theme-edge',palette.edge);document.documentElement.style.setProperty('--theme-wall',palette.wall);scene.setTheme(id);}
function configureEffects(){feedback.configure(save.sound,save.music&&!document.hidden);document.documentElement.dataset.reduced=String(save.reducedMotion);scene.setEffectQuality(save.effectQuality);scene.setPalette(save.palette);scene.setReducedMotion(save.reducedMotion||matchMedia('(prefers-reduced-motion: reduce)').matches);}
function settleAchievements(){const result=claimAchievements(save);if(result.names.length){feedback.effect('achievement');$('toast').textContent=`${result.names.join(' · ')} · +${result.gold} altın`;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,3000);}return result.gold;}
function persist(){const saved=saveProgress(save,storage);if(!saved)status('Bu tarayıcıda kayıt kullanılamıyor.');return saved;}
function clearRun(){currentRecording=null;successfulRecording=null;planningGestures=[];attemptSeconds=0;$('replay-solution').hidden=true;}
function stopReplay(){if(!isReplaying)return;isReplaying=false;if(session.world)scene.showFinished(session.world.clone());$('replay-stop').hidden=true;$('result').hidden=false;scene.setSpeed(sessionSpeed,mode==='live'?liveRate(modeId):1);updateUI();status('Tekrar sona erdi.');$('replay-solution').focus();}
function startReplay(){if(!successfulRecording?.playable||isReplaying)return;stopRewardAnimation();$('reward').textContent=mode==='live'||mode==='lab'?'Ödülsüz mod':lastAward?`✦ +${lastAward} altın`:'✦ Bölüm ödülü toplandı';isReplaying=true;$('result').hidden=true;$('replay-stop').hidden=false;scene.setPaused(false);scene.setSpeed(sessionSpeed);scene.startReplay(successfulRecording);updateUI();status('Başarılı denemenin kaydı · yeni ödül verilmez.');}
function renderTutorial(){
  const view=session.canEdit?(mode==='live'?liveLesson?.view:lesson?.view)??null:null;
  $('tutorial').hidden=!view;$('play').classList.toggle('tutorial-play',view?.kind==='play');
  if(view){$('tutorial-step').textContent=`${view.step}/${view.total}`;$('tutorial-message').textContent=view.message;}
  scene.setTutorial(view);
}
function tutorialEvent(event:TutorialEvent){
  if(mode==='live'&&liveLesson){if(event.type==='rotate')liveLesson.rotate(session.phase==='running');if(liveLesson.complete){save.liveTutorialDone=true;persist();liveLesson=null;}renderTutorial();return;}
  if(!lesson)return;lesson.handle(event);
  if(lesson.complete){if(!save.tutorialDone.includes(session.level.id)){save.tutorialDone.push(session.level.id);persist();}lesson=null;}
  renderTutorial();
}
function setupGuidance(){liveLesson=mode==='live'&&!save.liveTutorialDone?new LiveTutorial():null;lesson=mode==='normal'?lessonForLevel(session.level.id,save.tutorialDone,session.level.rings.length):null;scene.setMotionPreview(save.motionPreview);applyTheme(save.theme);configureEffects();renderTutorial();}
function togglePreview(){save.motionPreview=!save.motionPreview;persist();scene.setMotionPreview(save.motionPreview);updateUI();status(save.motionPreview?'İlk hareketin kısa izi açık.':'Yön izi kapalı.');}
let rewardFrame=0;
function stopRewardAnimation(){cancelAnimationFrame(rewardFrame);rewardFrame=0;}
function animateReward(gold:number){
  stopRewardAnimation();
  $('reward').innerHTML=gold?`<span class="reward-amount">✦ +0 altın</span><span class="coin-sparks" aria-hidden="true">${Array.from({length:6},(_,i)=>`<i style="--coin:${i}">✦</i>`).join('')}</span>`:'✦ Bölüm ödülü toplandı';
  if(!gold)return;
  const label=$('reward').querySelector<HTMLElement>('.reward-amount')!;
  if(save.reducedMotion||matchMedia('(prefers-reduced-motion: reduce)').matches){label.textContent=`✦ +${gold} altın`;return;}
  const began=performance.now();
  const tick=(time:number)=>{if($('result').hidden)return;const progress=Math.min(1,(time-began)/650);label.textContent=`✦ +${Math.round(gold*(1-(1-progress)**3))} altın`;if(progress<1)rewardFrame=requestAnimationFrame(tick);else rewardFrame=0;};
  rewardFrame=requestAnimationFrame(tick);
}
function tone(frequency:number,duration=.1){feedback.tone(frequency,duration);}
function status(text:string){$('status').textContent=text;}
function hasReleasePhases(){return session.level.sequence?.some(step=>step.waitFor!=='all'&&!step.waitFor.startsWith('key:'))??false;}
function updateUI(){
  document.documentElement.dataset.premium=String(save.commerce.products.includes('premium'));
  $('coins').textContent=String(save.coins);$('shop').setAttribute('aria-label',`Mağazayı aç — ${save.coins} altın`);
  $<HTMLButtonElement>('play').disabled=!ready||session.phase!=='planning';
  $<HTMLButtonElement>('restart').disabled=!ready;
  $<HTMLButtonElement>('undo').disabled=!ready||!session.canEdit||!session.history.length;
  $<HTMLButtonElement>('hint').disabled=!ready||!session.canEdit;
  if(session.level.challenge?.noHints)$<HTMLButtonElement>('hint').disabled=true;
  for(const id of ['settings','levels','shop','home'])$<HTMLButtonElement>(id).disabled=!ready||(session.phase==='running'&&!!session.world?.finished);
  $('level-number').textContent=String(session.level.id).padStart(2,'0');$('level-name').textContent=session.level.name;
  $('campaign-progress').textContent=`${save.completed.length} / ${LEVELS.length}`;$('live-indicator').hidden=session.phase!=='running';
  $('preview-toggle').hidden=!ready||session.phase!=='planning';$('preview-toggle').setAttribute('aria-pressed',String(save.motionPreview));
  $('pause').hidden=session.phase!=='running'||!!session.world?.finished;$('pause').textContent=userPaused?'▶':'Ⅱ';$('pause').setAttribute('aria-label',userPaused?'Devam et':'Duraklat');
  $('level-number').textContent=mode==='normal'?String(session.level.mastery??session.level.id).padStart(2,'0'):mode==='daily'?'☀':String(modeId);
  $('levels').querySelector('span')!.textContent=mode==='normal'&&session.level.mastery?'USTALIK ▦':'LEVEL ▦';
  $('campaign-progress').textContent=mode==='normal'?(session.level.mastery?`${stageProgress(session.level,session.world)} · ${session.moves}/${session.level.rules?.maxMoves??session.level.targetMoves}`:`${save.completed.filter(id=>id<=40).length}/40`):mode==='challenge'?`CHALLENGE · ${session.moves}/${session.level.challenge!.maxMoves}`:mode==='daily'?`${dailyStreak(save)} günlük seri`:mode==='live'?`LIVE · Rekor ${save.liveBest[modeId]??0}`:`DENEY · ${stageProgress(session.level,session.world)}`;
  const mission=objectiveText(session.level)+(!isReplaying&&session.level.rules?.requiredKeys?.length?` Anahtar: ${session.world?.collected.size??0}/${session.level.rules.requiredKeys.length}.`:'');
  if(missionLevel!==session.level||$('objective').dataset.mission!==mission+'|'+save.palette){missionLevel=session.level;$('objective').dataset.mission=mission+'|'+save.palette;$('objective').innerHTML=`<span class="objective-colors" aria-hidden="true">${session.level.cups.map(c=>`<i style="--ball:${paletteColors(save.palette)[c.color].css}">${paletteColors(save.palette)[c.color].symbol}</i>`).join('')}</span><span>${mission}</span>`;}
  $('speed').hidden=!isReplaying&&(session.phase!=='running'||!!session.world?.finished);$('speed').textContent=`${sessionSpeed}×`;
  if(ready)scene.setRingBudgets(session.level.ringLimits?.map((limit,i)=>Math.max(0,limit-(session.ringMoves[i]??0)))??[]);
  if(isReplaying){for(const id of ['settings','home','levels','shop','play','undo','restart','hint'])$<HTMLButtonElement>(id).disabled=true;$('pause').hidden=true;$('preview-toggle').hidden=true;$('campaign-progress').textContent='REPLAY · ÖDÜLSÜZ';}
}
function menuFocusSelector(){
  const active=document.activeElement;if(!(active instanceof HTMLElement))return undefined;
  if(active.id)return '#'+CSS.escape(active.id);
  for(const attr of ['data-nav','data-collection','data-mode','data-store-action','data-store-tab','data-product','data-skin-preview','data-skin','data-theme','data-preview-theme','data-palette','data-filter','data-campaign','data-special']){const value=active.getAttribute(attr);if(value!==null)return `[${attr}="${CSS.escape(value)}"]`;}
  return undefined;
}
function closeMenu(){
  menuRevision++;menuHistory.clear();store.dismiss();
  $('menu').hidden=true;scene?.setPaused(userPaused);currentHint=null;
  if(lastFocus?.isConnected)lastFocus.focus();else $('home').focus();
}
function backMenu(){
  store.dismiss();const previous=menuHistory.back();if(!previous){closeMenu();return;}
  previous.render();const revision=menuRevision;
  queueMicrotask(()=>{if(revision!==menuRevision||$('menu').hidden)return;document.querySelector<HTMLElement>('.menu-dialog')!.scrollTop=previous.scroll;const target=previous.focus?$('menu').querySelector<HTMLElement>(previous.focus):null;(target??$('menu-back')).focus({preventScroll:true});});
}
function openMenu(title:string,render:()=>void,key=title){
  const panel=document.querySelector<HTMLElement>('.menu-dialog')!,scroll=panel.scrollTop;
  if($('menu').hidden&&!menuHistory.current)lastFocus=document.activeElement as HTMLElement;
  const refresh=key==='Spin Sort'?(menuHistory.root({key,title,render}),false):menuHistory.visit({key,title,render},{scroll,focus:menuFocusSelector()});
  const revision=++menuRevision;scene.setPaused(true);$('menu-title').textContent=title;
  panel.dataset.screen=title==='Spin Sort'?'home':title==='Top koleksiyonu'?'collection':title==='Store'?'store':'panel';
  $('menu-content').replaceChildren();$('menu').hidden=false;$('close-menu').focus();$('menu-back').hidden=key==='Spin Sort';
  queueMicrotask(()=>{if(revision===menuRevision&&!$('menu').hidden)panel.scrollTop=refresh?scroll:0;});
}
function rotate(index:number,delta:number){if(!ready||userPaused||isReplaying)return;const from=[...session.angles];if(!session.rotate(index,delta))return;if(session.phase==='planning')planningGestures.push({from,to:[...session.angles]});scene.setAngles(session.angles);scene.focusRing(index);tutorialEvent({type:'rotate',ring:index});updateUI();status('Halka çevrildi.');feedback.effect('rotate');}
function restart(){if(!ready||isReplaying)return;clearRun();stopRewardAnimation();userPaused=false;scene.setPaused(false);session.restart();scene.reset(session.angles);$('result').hidden=true;selectedRing=0;setupGuidance();updateUI();status(session.level.lesson);if(mode==='live')playGame();}
function selectLevel(index:number){
  if(!ready||isReplaying||!LEVELS[index]||!isLevelUnlocked(save,LEVELS[index])||!session.selectLevel(index))return;clearRun();mode='normal';sessionSpeed=save.speed;levelView=session.level.mastery?'mastery':'classic';userPaused=false;stopRewardAnimation();closeMenu();scene.loadLevel(session.level);scene.setSpeed(sessionSpeed);scene.setSymbols(save.symbols);scene.setSkin(save.skin);$('result').hidden=true;selectedRing=0;setupGuidance();save.currentLevel=session.level.id;persist();updateUI();status(session.level.lesson);
}
function selectSpecial(kind:GameMode,id:number){
  const level=kind==='challenge'?CHALLENGES[id-1]:kind==='live'?LIVE_LEVELS[id-1]:kind==='lab'?LAB_LEVELS[id-1]:dailyLevel(dailyKey=localDateKey());if(!level||isReplaying)return;
  clearRun();mode=kind;modeId=id;sessionSpeed=kind==='live'?1:save.speed;userPaused=false;stopRewardAnimation();closeMenu();session.selectCustom(level);scene.loadLevel(level);scene.setSpeed(sessionSpeed,kind==='live'?liveRate(id):1);scene.setSymbols(save.symbols);scene.setSkin(save.skin);$('result').hidden=true;selectedRing=0;setupGuidance();updateUI();status(level.lesson);if(kind==='live'){playGame();if(!save.liveTutorialDone){showLiveIntro();}}
}
function showLiveIntro(){openMenu('Live nasıl oynanır?',showLiveIntro);$('menu-content').innerHTML='<div class="hint-emblem">↻</div><h3>Toplar hareket ederken halkaları çevir.</h3><p class="hint-message">Her topu kendi renkli kovasına yönlendir. Seçtiğin halka parlar. İlk bölüm yavaş başlar; Pause ile bekletebilirsin. Az hamle ve kısa süre daha yüksek skor getirir.</p><button id="start-live" class="play-button">Akışı başlat</button>';$('start-live').onclick=()=>{closeMenu();renderTutorial();};}
function playGame(){if(isReplaying)return;const world=session.play();if(!world)return;currentRecording=new SolutionRecording(session.level,planningGestures);currentRecording.attach(world);scene.setAngles(session.angles);scene.start(world);tutorialEvent({type:'play'});updateUI();status(hasReleasePhases()?'Görevdeki teslim sırasını izle.':'Akış kontrolünde.');tone(440,.09);}
function showLevels(){
  openMenu('Bölümler',showLevels);$('menu-content').innerHTML=levelsMarkup(save,levelView,mode==='normal'?session.level.id:0);
  $('menu-content').querySelectorAll<HTMLButtonElement>('[data-level]').forEach(button=>button.onclick=()=>selectLevel(Number(button.dataset.level)));
  $('menu-content').querySelectorAll<HTMLButtonElement>('[data-campaign]').forEach(button=>button.onclick=()=>{levelView=button.dataset.campaign as 'classic'|'mastery';showLevels();});
}
function showHome(){
  openMenu('Spin Sort',showHome);$('menu-content').innerHTML=homeMarkup(save);
  const actions:Record<string,()=>void>={play:()=>{if(mode==='normal'&&session.canEdit)closeMenu();else selectLevel(save.currentLevel-1);},levels:showLevels,challenge:showPlayModes,collection:showCollectionHub,statistics:showStatistics,daily:showDaily,achievements:showAchievements,store:()=>store.show(),settings:showSettings};
  $('menu-content').querySelectorAll<HTMLButtonElement>('[data-nav]').forEach(button=>button.onclick=actions[button.dataset.nav!]);
}
function showPlayModes(){openMenu('Challenges',showPlayModes);$('menu-content').innerHTML=`<div class="mode-list"><button data-mode="challenge"><span class="mode-art">${iconArt('challenge')}</span><strong>Challenge</strong><small>Beş hedefli görev</small></button><button data-mode="daily"><span class="mode-art">${iconArt('daily')}</span><strong>Daily Puzzle</strong><small>Günün bulmacası ve seri ödülü</small></button><button data-mode="live"><span class="mode-art">${iconArt('collection')}</span><strong>Live Mode</strong><small>Gerçek zamanlı yönlendir · ayrı skor</small></button><button data-mode="lab"><span class="mode-art">${iconArt('statistics')}</span><strong>Mekanik laboratuvarı</strong><small>Bölücü, bağlı halka ve hareket sınırı</small></button></div>`;
  $('menu-content').querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(button=>button.onclick=()=>button.dataset.mode==='daily'?showDaily():button.dataset.mode==='lab'?showLabs():showSpecials(button.dataset.mode as 'challenge'|'live'));
}
function showCollectionHub(){openMenu('Collection',showCollectionHub);$('menu-content').innerHTML=`<div class="mode-list"><button data-collection="store"><strong>Store</strong><small>Altın ve TEST Premium ürünleri</small></button><button data-collection="skins"><strong>Top görünümleri</strong><small>${save.owned.length}/${SKINS.length} açık · gerçek oyun önizlemeleri</small></button><button data-collection="palettes"><strong>Renk paletleri</strong><small>${paletteById(save.palette).name} · 5 farklı renk seti</small></button><button data-collection="themes"><strong>Themes</strong><small>${save.themes.length}/${THEMES.length} tema</small></button><button data-collection="achievements"><strong>Achievements</strong><small>Hedefler, altın ve özel görünümler</small></button></div>`;
  $('menu-content').querySelectorAll<HTMLButtonElement>('[data-collection]').forEach(button=>button.onclick=()=>button.dataset.collection==='skins'?showShop():button.dataset.collection==='themes'?showThemes():button.dataset.collection==='palettes'?showPalettes():button.dataset.collection==='store'?store.show():showAchievements());
}
function showLabs(){openMenu('Mekanik laboratuvarı',showLabs);$('menu-content').innerHTML=`<p class="menu-summary">Üç mekanik deneyi ve Ustalık 50 / 100 provaları. Yıldız, altın ve ilerleme yazılmaz.</p><div class="mode-list">${LAB_LEVELS.map((level,i)=>`<button data-lab="${i+1}"><strong>${level.name}</strong><small>${level.lesson}</small></button>`).join('')}</div>`;$('menu-content').querySelectorAll<HTMLButtonElement>('[data-lab]').forEach(button=>button.onclick=()=>selectSpecial('lab',Number(button.dataset.lab)));}
function showSpecials(kind:'challenge'|'live'){
  openMenu(kind==='challenge'?'Challenge':'Live Mode',()=>showSpecials(kind));const levels=kind==='challenge'?CHALLENGES:LIVE_LEVELS;
  $('menu-content').innerHTML=`<p class="menu-summary">${kind==='challenge'?'İlk başarı ödüllüdür; daha iyi yıldız başına +5 altın. Sınırsız tekrar deneyebilirsin.':'Deneysel · Toplar hemen hareket eder. Ana bölüm yıldızlarını ve altınlarını etkilemez.'}</p><div class="mode-list">${levels.map((level,i)=>`<button data-special="${i+1}"><strong>${level.name}</strong><small>${kind==='challenge'?`${level.challenge!.maxMoves} hamle${level.challenge!.noHints?' · ipucusuz':''}${level.challenge!.ringLimit?' · halka başına 1 hareket':''} · ★ ${save.challengeStars[i+1]??0} · ✦ ${save.challengeStars[i+1]?0:level.reward}`:'Rekor: '+(save.liveBest[i+1]??0)+(save.liveWins.includes(i+1)?' · ✓ Tamamlandı':' · Canlı dene')}</small></button>`).join('')}</div>`;
  $('menu-content').querySelectorAll<HTMLButtonElement>('[data-special]').forEach(button=>button.onclick=()=>selectSpecial(kind,Number(button.dataset.special)));
}
function showDaily(){
  const key=localDateKey();openMenu('Daily Puzzle',showDaily);$('menu-content').innerHTML=dailyMarkup(save,key);$('daily-play').onclick=()=>selectSpecial('daily',1);
}
function showAchievements(){settleAchievements();persist();updateUI();openMenu('Achievements',showAchievements);$('menu-content').innerHTML=achievementsMarkup(save);}
function showStatistics(){openMenu('Statistics',showStatistics);$('menu-content').innerHTML=statisticsMarkup(save);}
function showPalettes(message=''){
  openMenu('Renk paletleri',()=>showPalettes());$('menu-content').innerHTML=`<p class="menu-summary">✦ ${save.coins} altın · Paletler top, kova ve renkli geçitlere birlikte uygulanır.</p><div class="palette-grid">${PALETTES.map(p=>`<article class="palette-card ${save.palette===p.id?'selected':''}"><img class="palette-render" src="${palettePreview(p.id)}" alt="${p.name} paletinin top ve halka önizlemesi"><h3>${p.name}</h3><p>${p.description}</p><button data-palette="${p.id}" ${save.palette===p.id?'disabled':''}>${save.palette===p.id?'✓ Seçili':save.palettes.includes(p.id)?'Kullan':'✦ '+p.cost}</button></article>`).join('')}</div><p class="shop-message" role="status">${message}</p>`;
  $('menu-content').querySelectorAll<HTMLButtonElement>('[data-palette]').forEach(button=>button.onclick=()=>{const id=button.dataset.palette as PaletteId;if(buyPalette(save,id)==='insufficient'){showPalettes('Yeterli altın yok.');return;}persist();scene.setPalette(id);feedback.effect('theme');updateUI();applyTheme(save.theme);showPalettes('Renk paleti uygulandı.');});
}
function showThemes(message=''){
  openMenu('Themes',()=>showThemes());$('menu-content').innerHTML=`<p class="menu-summary">✦ ${save.coins} altın · ${save.themes.length}/${THEMES.length} tema</p><div class="skin-grid">${THEMES.map(theme=>`<article class="skin-card ${theme.id===save.theme?'selected':''}"><div class="theme-sample ${theme.id}" style="background:${theme.background};--sample-edge:${theme.edge};--sample-wall:${theme.wall}"><i></i><img class="theme-orb" src="${scene.skinPreview('classic')[0]}" alt="Top materyali"><span>▰ ▰</span></div><h3>${theme.name}</h3><p>${theme.description}</p><button data-preview-theme="${theme.id}">Önizle</button><button data-theme="${theme.id}" ${theme.id===save.theme?'disabled':''}>${theme.id===save.theme?'✓ Seçili':save.themes.includes(theme.id)?'Kullan':'premium' in theme?'▣ TEST Premium':`✦ ${theme.cost}`}</button></article>`).join('')}</div><p class="shop-message">${message||'Temalar fizik ve bölüm durumunu değiştirmez.'}</p>`;
  $('menu-content').querySelectorAll<HTMLButtonElement>('[data-theme]').forEach(button=>button.onclick=()=>{const id=button.dataset.theme as ThemeId;if('premium' in themeById(id)&&!save.themes.includes(id)){store.show('premium');return;}const result=buyTheme(save,id);if(result==='insufficient'){showThemes('Bu tema için altının yetmiyor.');return;}save.theme=id;settleAchievements();persist();applyTheme(id);feedback.effect('theme');updateUI();showThemes('Tema seçildi.');});
  $('menu-content').querySelectorAll<HTMLButtonElement>('[data-preview-theme]').forEach(button=>button.onclick=()=>{applyTheme(button.dataset.previewTheme as ThemeId);previewHadResult=!$('result').hidden;$('result').hidden=true;$('menu').hidden=true;$('theme-preview-bar').hidden=false;document.querySelector('.game-shell')!.classList.add('theme-previewing');});
}
function endThemePreview(){applyTheme(save.theme);$('result').hidden=!previewHadResult;$('theme-preview-bar').hidden=true;document.querySelector('.game-shell')!.classList.remove('theme-previewing');showThemes();}
function showShop(){openMenu('Top koleksiyonu',showShop);renderShop();}
function renderShop(message=''){
  const filter=collectionFilter;menuHistory.updateRender(()=>{collectionFilter=filter;showShop();});
  $('menu-content').innerHTML=collectionMarkup(save,id=>scene.skinPreview(id),message,collectionFilter);
  $('menu-content').querySelectorAll<HTMLButtonElement>('[data-skin-preview]').forEach(button=>button.onclick=()=>showSkinDetails(button.dataset.skinPreview as SkinId));
  $('menu-content').querySelectorAll<HTMLButtonElement>('[data-filter]').forEach(button=>button.onclick=()=>{collectionFilter=button.dataset.filter as CollectionFilter;renderShop();});
  $('menu-content').querySelectorAll<HTMLButtonElement>('[data-skin]').forEach(button=>button.onclick=()=>{
    const id=button.dataset.skin as SkinId;
    if(save.owned.includes(id)){equipSkin(save,id);persist();scene.setSkin(save.skin);renderShop('Görünüm seçildi.');return;}
    const result=buySkin(save,id);
    if(result==='bought'){settleAchievements();persist();scene.setSkin(save.skin);updateUI();tone(880,.15);showSkinDetails(id,'Yeni görünümün hazır!',true);}
    else if(result==='insufficient'){const skin=SKINS.find(item=>item.id===id)!;renderShop(`${skin.cost-save.coins} altın daha gerekiyor.`);}
  });
}
function showSkinDetails(id:SkinId,message='',unlocked=false){
  const skin=SKINS.find(s=>s.id===id)!;openMenu(skin.name+' · Görünüm',()=>showSkinDetails(id),'skin:'+id);$('menu-content').innerHTML=skinDetailMarkup(save,id,scene.skinPreview(id),message,unlocked);
  $('skin-detail-back').onclick=backMenu;
  const stage=$('skin-orbit'),image=$('skin-hero-image');stage.onpointermove=e=>{if(save.reducedMotion||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const bounds=stage.getBoundingClientRect();image.style.transform=`rotate(${(e.clientX-bounds.left-bounds.width/2)/bounds.width*22}deg)`;};stage.onpointerleave=()=>image.style.transform='';
  $('skin-detail-action').onclick=()=>{if(save.owned.includes(id)){equipSkin(save,id);persist();scene.setSkin(id);showSkinDetails(id,'Görünüm oyunda etkin.');return;}if(skin.premium){store.show('premium');return;}const result=buySkin(save,id);if(result==='bought'){settleAchievements();persist();scene.setSkin(id);updateUI();feedback.effect('achievement');showSkinDetails(id,'Yeni görünümün hazır!',true);}else if(result==='insufficient')showSkinDetails(id,`${skin.cost-save.coins} altın daha gerekiyor.`);};
}
function showHint(recordUse=true){
  if(session.level.challenge?.noHints)return;if(recordUse)session.hintsUsed++;
  openMenu('İpucu',()=>showHint(false));currentHint=getVerifiedHint(session);
  if(!currentHint){$('menu-content').innerHTML='<p>Bu durum için doğrulanmış ipucu bulunamadı.</p>';return;}
  const hint=currentHint;
  $('menu-content').innerHTML=`<div class="hint-emblem">✧</div><h3 class="hint-title">${hint.title}</h3><p class="hint-message">${hint.action==='restart'?'Bu konumdan doğrulanmış devam yok. Baştan başlayıp ilk yönü görebilirsin.':'Doğrulanmış yolun bir sonraki halkası ve dönüş yönü kısa süre gösterilir. Halkayı sen döndürürsün.'}</p><button id="apply-hint" class="play-button">${hint.action==='restart'?'Baştan başla ve yönü göster':hint.action==='wait'?'Devam et':'Yönü göster'}</button><p class="hint-free">Yönü görmek ücretsizdir · Bu denemede Perfect Flow alınmaz.</p><button id="extra-hint" class="secondary-button" ${hint.action==='restart'||hint.action==='wait'?'disabled':''}>Bir halkayı doğrulanmış konuma getir · ${save.commerce.hintCredits?'1 kredi ('+save.commerce.hintCredits+' var)':'✦ '+ECONOMY.hint}</button><p id="extra-hint-status" role="status"></p>`;
  $('extra-hint').onclick=()=>{const index=hint.ring??hint.angles.findIndex((a,i)=>angularDistance(a,session.angles[i])>1&&session.canRotate(i));const result=applyExtraHint(save,()=>{if(index<0||!session.canRotate(index))return false;const before=session.moves;rotate(index,rotationDelta(session.angles[index],hint.angles[index]));return session.moves>before;});if(result==='credit'||result==='gold'){persist();closeMenu();updateUI();status('Doğrulanmış bir halka konumu uygulandı.');}else $('extra-hint-status').textContent=result==='insufficient'?'Yeterli altın veya ipucu kredisi yok.':'Bu durumda uygulanacak doğrulanmış bir dönüş yok.';};
  $('apply-hint').onclick=()=>{
    if(hint.action==='restart'){session.restart();session.hintsUsed=1;scene.reset(session.angles);setupGuidance();if(mode==='live')playGame();}
    const index=hint.ring??hint.angles.findIndex((angle,i)=>angularDistance(angle,session.angles[i])>1&&session.canRotate(i));
    closeMenu();if(index>=0)scene.showVisualHint(index,Math.sign(rotationDelta(session.angles[index],hint.angles[index])));updateUI();status(index>=0?'Parlayan halkayı ok yönünde çevir.':hint.action==='wait'?'Sıradaki teslimi veya anahtarı bekle.':'Yol hazır; Play ile dene.');
  };
}
function showSettings(){
  openMenu('Ayarlar',showSettings);$('menu-content').innerHTML=`<div class="settings-fields"><label>Ses efektleri<input id="sound" type="checkbox"></label><label>Müzik<input id="music" type="checkbox"></label><label>Hareketi azalt<input id="reducedMotion" type="checkbox"></label><label>Titreşim<input id="vibration" type="checkbox"></label><label>Renk sembolleri<input id="symbols" type="checkbox"></label><label>Kısa hareket önizlemesi<input id="motionPreview" type="checkbox"></label></div><label class="quality-setting">Efekt kalitesi<select id="effect-quality"><option value="low">Low · Hafif</option><option value="medium">Medium · Dengeli</option><option value="high">High · Yoğun</option></select></label><button id="settings-palette" class="secondary-button">Renk paleti · ${paletteById(save.palette).name}</button><button id="check-performance" class="secondary-button">Performans ölçümünü göster</button><p id="performance-readout" class="settings-note" role="status"></p><button id="test-sound" class="secondary-button">♪ Sesi dene</button><p id="audio-status" class="settings-note" role="status">Ses ilk dokunuşta etkinleşir.</p><p class="settings-note">Halkaları doğrudan sürükle veya dokun.<br>Klavyede labirente odaklan: ↑ / ↓ halka seçer, ← / → döndürür.<br>R: Restart · Z: Undo</p><button id="replay-tutorial" class="secondary-button">Öğreticiyi yeniden başlat · Bölüm 1</button><button id="close-settings" class="play-button">Oyuna dön</button>`;
  for(const id of ['sound','music','reducedMotion','vibration','symbols','motionPreview'] as const){const input=$<HTMLInputElement>(id);input.checked=save[id];input.onchange=()=>{save[id]=input.checked;persist();configureEffects();if(id==='symbols')scene.setSymbols(save.symbols);if(id==='sound'||id==='music')void feedback.unlock().then(()=>{if(id==='sound')tone(520);});if(id==='motionPreview'){scene.setMotionPreview(save.motionPreview);updateUI();}};}
  $<HTMLSelectElement>('effect-quality').value=save.effectQuality; $<HTMLSelectElement>('effect-quality').onchange=()=>{save.effectQuality=$<HTMLSelectElement>('effect-quality').value as typeof save.effectQuality;persist();configureEffects();};$('settings-palette').onclick=()=>showPalettes();
  $('check-performance').onclick=()=>{const sample=scene.performanceSnapshot();$('performance-readout').textContent=`${sample.samples} görünür oyun karesi · ${sample.fps?.toFixed(1)??'—'} FPS · p95 ${sample.p95?.toFixed(1)??'—'} ms · ${sample.textures} doku, yaklaşık ${sample.textureMB.toFixed(1)} MB ham RGBA · JS heap ${sample.heapMB?.toFixed(1)??'tarayıcı sunmuyor'} MB. Bu tarayıcı ölçümüdür; cihaz testi değildir.`;};
  $('test-sound').onclick=async()=>{if(!save.sound){$('audio-status').textContent='Önce Ses efektleri seçeneğini aç.';return;}$('audio-status').textContent='Ses başlatılıyor…';const playing=await feedback.test();$('audio-status').textContent=playing?'Test sesi gönderildi. Duyulmuyorsa sekme ve cihaz sesini kontrol et.':'Tarayıcı sesi başlatamadı. Sayfayı yenileyip Sesi dene düğmesine tekrar bas.';};
  $('replay-tutorial').onclick=()=>{save.tutorialDone=[];persist();selectLevel(0);};
  $('close-settings').onclick=closeMenu;
}
scene=new RingsScene({
  ready:()=>{
    ready=true;if(session.levelIndex!==0)scene.loadLevel(session.level);scene.setSymbols(save.symbols);scene.setSkin(save.skin);
    const canvas=document.querySelector('canvas')!;canvas.tabIndex=0;canvas.setAttribute('role','application');canvas.setAttribute('aria-label','Halka labirenti. Yukarı aşağı halka seçer, sağ sol döndürür.');
    canvas.onfocus=()=>scene.focusRing(selectedRing);canvas.onblur=()=>scene.focusRing(-1);scene.setSpeed(sessionSpeed);setupGuidance();settleAchievements();persist();updateUI();status(session.level.lesson);if(!sandbox)showHome();
  },
  begin:index=>{if(!session.canRotate(index)){status('Önce anahtarı topla veya hareket sınırını kontrol et.');return false;}selectedRing=index;gestureMoves=session.moves;gestureStart=[...session.angles];scene.focusRing(index);return session.begin(index);},
  change:(index,angle)=>{session.preview(index,angle);scene.setAngles(session.angles);updateUI();if(performance.now()-lastRotationSound>110){lastRotationSound=performance.now();feedback.effect('rotate');}},
  end:()=>{session.commit();if(session.moves>gestureMoves){if(session.phase==='planning')planningGestures.push({from:gestureStart,to:[...session.angles]});tutorialEvent({type:'rotate',ring:selectedRing});}updateUI();status(hasReleasePhases()?'Görevdeki teslim sırasını izle.':'Geçit yerleşti.');tone(340,.045);},
  motion:()=>tutorialEvent({type:'motion'}),
  tick:seconds=>{if(isReplaying||document.hidden)return;save.statistics.seconds+=seconds;attemptSeconds+=seconds;timeSinceSave+=seconds;if(timeSinceSave>=15){timeSinceSave=0;persist();}},
  effect:effect=>{if(isReplaying)return;feedback.effect(effect);if(effect==='key'||effect==='unlock'){status(effect==='key'?'Anahtar alındı.':'Kilit açıldı.');updateUI();}if(save.vibration&&(effect==='key'||effect==='unlock'||effect==='color'))navigator.vibrate?.(12);},
  arrive:(color,correct)=>{if(isReplaying)return;if(session.world?.violation){status(session.world.violation);feedback.effect('wrong');return;}if(correct){if(liveLesson){liveLesson.deliver(true);if(liveLesson.complete){save.liveTutorialDone=true;persist();liveLesson=null;}renderTutorial();}tone(color==='pink'?660:784,.16);setTimeout(()=>tone(color==='pink'?880:1046,.18),75);if(save.vibration)navigator.vibrate?.(18);const count=session.world?.states.filter(state=>state.done).length??0;status(hasReleasePhases()&&!session.world?.finished?`${count} tamam. Sıradaki geçidi aç.`:'Tam yerine!');updateUI();}},
  finish:()=>{
    if(isReplaying){stopReplay();return;}
    session.finish();const won=session.phase==='success';let earned=0,stars=0;
    if(session.world)session.world.onStep=null;
    renderTutorial();
    let perfectGold=0;
    if(won){
      successfulRecording=currentRecording;if(mode!=='live'&&mode!=='lab')recordVictory(save,session.moves);
      stars=starRating(session.moves,session.level.stars);
      if(mode==='normal'){adSchedule.record(session.level.id);const reward=awardCompletion(save,session.level,session.moves);earned=reward.gold;stars=reward.stars;perfectGold=awardPerfect(save,session.level,session.moves,session.hintsUsed);earned+=perfectGold;if(!session.hintsUsed&&!save.noHintWins.includes(session.level.id))save.noHintWins.push(session.level.id);}
      if(mode==='challenge')earned=awardChallenge(save,modeId,session.level,session.moves);
      if(mode==='daily')earned=awardDaily(save,dailyKey,stars);
      if(mode==='live'){if(!save.liveWins.includes(modeId))save.liveWins.push(modeId);save.liveBest[modeId]=Math.max(save.liveBest[modeId]??0,liveScore(session.moves,attemptSeconds,session.world?.states.length??session.level.balls.length));}
      earned+=settleAchievements();persist();feedback.effect(perfectGold?'perfect':'finish');
    }
    const perfect=won&&mode==='normal'&&!session.hintsUsed&&session.moves<=(session.level.perfect?.moves??session.level.stars.three);
    $('perfect-flow').hidden=!perfect;$('perfect-flow').textContent=perfectGold?`PERFECT FLOW! · +${perfectGold} altın`:'PERFECT FLOW! · Bonus önceden alındı';
    $('result-kicker').textContent=won?'LEVEL COMPLETE':'YENİDEN DENE';$('result-title').textContent=won?'Renkler yerinde!':'Başka bir yol var.';
    $('result-description').textContent=won?`${session.moves} hareket · ★★★ ${session.level.stars.three} harekete kadar${mode==='live'?` · Skor ${liveScore(session.moves,attemptSeconds,session.world?.states.length??session.level.balls.length)}`:''}`:session.world?.violation??(session.level.challenge||session.level.rules?.maxMoves?'Görev koşullarını koruyarak tekrar dene.':'Geçidi değiştirip tekrar dene.');
    $('result-stars').hidden=!won;$('result-stars').setAttribute('aria-label',`${stars} yıldız`);$('result-stars').querySelectorAll('span').forEach((span,i)=>span.classList.toggle('earned',i<stars));
    $('reward').hidden=!won;
    $('retry').textContent=won?'Yeniden oyna':'Düzeni düzelt';$('result').classList.toggle('won',won);$('result').hidden=false;
    lastAward=earned;if(won){animateReward(earned);if(mode==='live'||mode==='lab')$('reward').textContent='Deneysel mod · altın ödülü yok';}
    $('replay-solution').hidden=!won||!successfulRecording?.playable;
    $('next').textContent=mode==='normal'&&session.level.id===40?'Ustalık Yolu →':'Next Level →';
    $('next').hidden=!won||(mode==='normal'?session.levelIndex===LEVELS.length-1:mode==='daily'||modeId===(mode==='lab'?LAB_LEVELS.length:5));updateUI();($('next').hidden?$('retry'):$('next')).focus();
  },
});
new Phaser.Game({type:Phaser.CANVAS,parent:'game',width:BOARD.width,height:BOARD.height,backgroundColor:'#f0edf8',scene:[scene],scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},antialias:true,input:{activePointers:2},fps:{target:60}});
$('settings').onclick=showSettings;$('levels').onclick=showLevels;$('shop').onclick=()=>store.show();$('hint').onclick=()=>showHint();$('close-menu').onclick=closeMenu;
$('home').onclick=showHome;$('menu-back').onclick=backMenu;$('end-theme-preview').onclick=endThemePreview;
$('pause').onclick=()=>{userPaused=!userPaused;scene.setPaused(userPaused);updateUI();status(userPaused?'Duraklatıldı.':'Akış sürüyor.');};
$('speed').onclick=()=>{sessionSpeed=sessionSpeed===1?2:1;if(!isReplaying){save.speed=sessionSpeed;persist();}scene.setSpeed(sessionSpeed,mode==='live'&&!isReplaying?liveRate(modeId):1);updateUI();};
$('replay-solution').onclick=startReplay;$('replay-stop').onclick=stopReplay;
$('preview-toggle').onclick=togglePreview;
$('skip-tutorial').onclick=()=>{if(liveLesson){liveLesson.skip();save.liveTutorialDone=true;persist();liveLesson=null;renderTutorial();return;}if(lesson){lesson.skip();tutorialEvent({type:'play'});status('Bu öğretici atlandı.');}};
$('undo').onclick=()=>{if(isReplaying)return;const before=session.world,from=[...session.angles];if(session.undo()){if(session.world&&before!==session.world){scene.restoreWorld(session.world);currentRecording?.attach(session.world);}else scene.setAngles(session.angles);if(session.phase==='planning')planningGestures.push({from,to:[...session.angles]});updateUI();status('Bir hareket geri.');}};
$('restart').onclick=restart;$('play').onclick=playGame;$('next').onclick=()=>{const next=()=>mode==='normal'?selectLevel(session.levelIndex+1):selectSpecial(mode,modeId+1);if(mode==='normal'&&session.phase==='success'&&adSchedule.take(save,performance.now()/1000,true))store.showInterstitial(next);else next();};
$('retry').onclick=()=>{if(session.phase==='success'||mode==='live'||mode==='challenge'||mode==='lab'){restart();return;}clearRun();session.retry();scene.reset(session.angles);$('result').hidden=true;setupGuidance();updateUI();status('Düzenin korundu.');};
window.addEventListener('keydown',event=>{
  if(event.repeat)return;
  if(isReplaying){if(event.code==='Escape'){event.preventDefault();stopReplay();}return;}
  if(!$('theme-preview-bar').hidden){if(event.code==='Escape')endThemePreview();return;}
  if(!$('menu').hidden){
    if(event.code==='Escape'){event.preventDefault();backMenu();}
    if(event.code==='Tab'){
      const focusable=Array.from($('menu').querySelectorAll<HTMLElement>('button:not(:disabled),input,select,a[href]')).filter(element=>element.offsetParent!==null);
      const first=focusable[0],last=focusable.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    }return;
  }
  if(event.code==='KeyR'){event.preventDefault();restart();}if(event.code==='KeyZ')$('undo').click();
  if(event.target instanceof HTMLCanvasElement){
    if(event.code==='ArrowUp'||event.code==='ArrowDown'){event.preventDefault();selectedRing=(selectedRing+(event.code==='ArrowUp'?1:session.level.rings.length-1))%session.level.rings.length;scene.focusRing(selectedRing);status(`${selectedRing+1}. halka seçildi.`);}
    if(event.code==='ArrowLeft'||event.code==='ArrowRight'){event.preventDefault();const step=session.level.rotationStep??15;rotate(selectedRing,event.code==='ArrowLeft'?-step:step);}
  }
  if(event.target instanceof HTMLButtonElement||event.target instanceof HTMLInputElement)return;
  if(event.code==='Space'){event.preventDefault();playGame();}
});
document.addEventListener('pointerdown',()=>{void feedback.unlock();},{capture:true,passive:true});
document.addEventListener('keydown',()=>{void feedback.unlock();},{capture:true});
document.addEventListener('visibilitychange',()=>feedback.configure(save.sound,save.music&&!document.hidden));
window.addEventListener('pagehide',()=>{if(!isReplaying)persist();});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>{if(ready)configureEffects();});
window.addEventListener('storage',event=>{
  if(!ready||event.key!==SAVE_KEY)return;
  Object.assign(save,loadProgress(storage));applyTheme(save.theme);scene.setSkin(save.skin);scene.setSymbols(save.symbols);scene.setMotionPreview(save.motionPreview);configureEffects();
  if(save.tutorialDone.includes(session.level.id))lesson=null;renderTutorial();updateUI();
});












