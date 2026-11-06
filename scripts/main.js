// Visual Overhaul v3.1.0 (автор: huskosbs) - Mindustry v7 (build 146+), JS mod (client-side)

var VO_VERSION = "3.8.1";

function col(h){ return Color.valueOf(h); }
function pref(k, d){ return Core.settings.getBool(k, d); }
var customSnd = {};
function loadCustomSounds(){
  if(Vars.headless) return;
  var names = ["bulk", "hiss", "splash", "place", "break", "boom", "spawn", "wave", "win", "lose", "unlock"];
  for(var i = 0; i < names.length; i++){
    try{ customSnd[names[i]] = Vars.tree.loadSound("vo-" + names[i]); }catch(err){}
  }
}
loadCustomSounds();
function sndUI(name, vol){
  try{
    var s = customSnd[name];
    if(s != null && s != undefined) s.play(vol);
  }catch(err){}
}
function snd(name, x, y, pitch, vol){
  try{
    var s = customSnd[name];
    if(s == null || s == undefined) s = Sounds[name];
    if(s != null && s != undefined) s.at(x, y, pitch, vol);
  }catch(err){}
}

/* ---------- диагностика: ошибки показываются в игре ---------- */
var errShown = {};
function fail(stage, err){
  if(errShown[stage]) return;
  errShown[stage] = String(err).substring(0, 90);
  try{ Log.err("[VisualOverhaul] " + stage + ": " + err); }catch(e1){}
  try{
    if(!Vars.headless && Vars.ui != null){
      Vars.ui.showInfoToast("[scarlet]VO ошибка (" + stage + "): " + String(err).substring(0, 140), 9);
    }
  }catch(e2){}
}
function guard(stage, fn){
  try{ fn(); }catch(err){ fail(stage, err); }
}

var cGold = col("ffd37f"), cOrange = col("ff8a3a"), cRed = col("ff4d4d"),
    cCyan = col("7fe5ff"), cGrey = col("8a8f99");

/* ===================== ЭФФЕКТЫ ===================== */

var buildFx = new Effect(38, 160, function(e){
  var s = Math.max(1, e.rotation) * 4;
  Draw.color(Pal.accent, Color.white, e.fout() * 0.6);
  Lines.stroke(e.fout() * 2.2);
  Lines.square(e.x, e.y, s * (0.6 + e.finpow() * 0.9), 45 * e.fin());
  Lines.circle(e.x, e.y, s * (0.3 + e.finpow() * 1.6));
  Angles.randLenVectors(e.id, 8, s * 0.5 + s * 1.2 * e.finpow(), function(x, y){
    Fill.circle(e.x + x, e.y + y + e.fin() * 4, 0.6 + e.fout() * 2);
  });
  Drawf.light(e.x, e.y, s * 4 * e.fout(), Pal.accent, 0.6 * e.fout());
});

var breakFx = new Effect(34, 160, function(e){
  var s = Math.max(1, e.rotation) * 4;
  Draw.color(cRed, cGrey, e.fin());
  Angles.randLenVectors(e.id, 12, 6 + s * 1.4 * e.finpow(), function(x, y){
    Fill.square(e.x + x, e.y + y, e.fout() * 3 + 0.5, x * 9);
  });
  Draw.color(cRed, Color.white, e.fin());
  Lines.stroke(e.fout() * 2);
  Lines.circle(e.x, e.y, s * (1.7 - e.finpow() * 1.3));
  Drawf.light(e.x, e.y, s * 3 * e.fout(), cRed, 0.5 * e.fout());
});

// Создание юнита: кольцо, шестиугольник, сканирующая линия, частицы
var spawnFx = new Effect(46, 200, function(e){
  var s = Math.max(6, e.rotation);
  Draw.color(e.color, Color.white, e.fout() * 0.7);
  Lines.stroke(1.2 + e.fout() * 2);
  Lines.circle(e.x, e.y, s * (0.4 + e.finpow() * 1.3));
  Lines.poly(e.x, e.y, 6, s * (0.5 + e.fout() * 0.7), e.fin() * 120);
  var dy = s * (1 - 2 * e.fin());
  Lines.stroke(1);
  Lines.line(e.x - s, e.y + dy, e.x + s, e.y + dy);
  Angles.randLenVectors(e.id, 10, s * e.finpow() * 1.5, function(x, y){
    Fill.circle(e.x + x, e.y + y + e.fin() * s, e.fout() * 1.8);
  });
  Drawf.light(e.x, e.y, s * 3 * e.fout(), e.color, 0.6 * e.fout());
});

var deathFx = new Effect(50, 300, function(e){
  var s = Math.max(8, e.rotation);
  Draw.color(Color.white, cOrange, e.fin());
  Fill.circle(e.x, e.y, s * 0.9 * e.fout() * e.fout());
  Draw.color(e.color, Color.white, e.fout() * 0.5);
  Lines.stroke(e.fout() * 3);
  Lines.circle(e.x, e.y, s * 0.5 + e.finpow() * s * 2.2);
  Draw.color(Color.white, cGold, e.fin());
  Lines.stroke(e.fout() * 1.5 + 0.3);
  Angles.randLenVectors(e.id + 1, 14, s * 0.3 + e.finpow() * s * 2.4, function(x, y){
    Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), e.fout() * 5 + 1);
  });
  for(var i = 0; i < 4; i++){
    Drawf.tri(e.x, e.y, 3 * e.fout(), s * 1.6 * e.fout(), i * 90 + e.fin() * 60);
  }
  Draw.color(cGrey, 0.5 * e.fout());
  Angles.randLenVectors(e.id + 2, 6, s * 0.2 + e.finpow() * s, function(x, y){
    Fill.circle(e.x + x, e.y + y + e.fin() * 6, 2 + e.fin() * 4);
  });
  Drawf.light(e.x, e.y, s * 5 * e.fout(), e.color, 0.8 * e.fout());
});

// Выстрел орудия: аккуратный язык пламени цвета снаряда, искры, лёгкий дым, гильза
function makeGunFx(sc){
  return new Effect(16 + sc * 4, 100, function(e){
    var ang = e.rotation, a = e.fout();
    Draw.color(e.color, Color.white, 0.3 * a);
    Draw.alpha(0.9 * a);
    Drawf.tri(e.x, e.y, 2 * sc * a, 8 * sc * a, ang);
    Drawf.tri(e.x, e.y, 1.4 * sc * a, 3 * sc * a, ang + 180);
    Drawf.tri(e.x, e.y, 1.2 * sc * a, 4 * sc * a, ang + 90);
    Drawf.tri(e.x, e.y, 1.2 * sc * a, 4 * sc * a, ang - 90);
    if(sc >= 2.3){
      Draw.color(e.color);
      Draw.alpha(0.4 * a);
      Lines.stroke(0.6 + a * sc * 0.5);
      Lines.circle(e.x, e.y, 2 * sc + e.finpow() * 6 * sc);
    }
    Draw.color(cGold, e.color, e.fin());
    Lines.stroke(a * 0.9 + 0.2);
    Angles.randLenVectors(e.id, 3 + Math.round(sc * 2), 3 * sc + e.finpow() * 14 * sc, ang, 22, function(x, y){
      Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), a * (1.5 + sc) + 0.3);
    });
    Draw.color(cGrey, 0.18 * a);
    Angles.randLenVectors(e.id + 7, 2 + Math.round(sc), 2 + e.finpow() * 9 * sc, ang, 40, function(x, y){
      Fill.circle(e.x + x, e.y + y, (0.6 + e.fin() * 1.6) * sc);
    });
    if(sc < 1.5){
      Draw.color(cGold, cGrey, e.fin());
      Angles.randLenVectors(e.id + 3, 1, 4 + e.finpow() * 16, ang + 180, 40, function(x, y){
        Fill.rect(e.x + x, e.y + y, 2, 1, e.fin() * 420);
      });
    }
    Drawf.light(e.x, e.y, 22 * sc * a, e.color, 0.35 * a);
  });
}
var gunFxs = [makeGunFx(1.1), makeGunFx(1.6), makeGunFx(2.3), makeGunFx(3.2)];

/* ---------- эффекты по типам турелей ---------- */

// Артиллерия: тяжёлая оранжевая вспышка, пыль от отдачи, ударная волна по земле, дым
function makeArtilleryFx(sc){
  return new Effect(30 + sc * 6, 160, function(e){
    var ang = e.rotation, a = e.fout();
    Draw.color(cOrange, Color.white, 0.4 * a);
    Draw.alpha(0.9 * a);
    Drawf.tri(e.x, e.y, 3 * sc * a, 10 * sc * a, ang);
    Drawf.tri(e.x, e.y, 2 * sc * a, 4 * sc * a, ang + 180);
    Draw.color(col("9a8f7a"), 0.35 * a);
    Angles.randLenVectors(e.id, 5 + Math.round(sc * 2), 4 * sc + e.finpow() * 18 * sc, function(x, y){
      Fill.circle(e.x + x, e.y + y, (1 + e.fin() * 3.2) * sc);
    });
    Draw.color(Color.white, 0.25 * a);
    Lines.stroke(a * 1.4);
    Lines.circle(e.x, e.y, 3 * sc + e.finpow() * 16 * sc);
    Draw.color(cGrey, 0.3 * a);
    Angles.randLenVectors(e.id + 5, 3, 3 + e.finpow() * 20 * sc, ang, 14, function(x, y){
      Fill.circle(e.x + x, e.y + y, (1 + e.fin() * 2.4) * sc);
    });
    Drawf.light(e.x, e.y, 26 * sc * a, cOrange, 0.4 * a);
  });
}

// Огнемёты: язык огня, тлеющие угольки, жар и лёгкий дым
function makeFlameFx(sc){
  return new Effect(22 + sc * 4, 100, function(e){
    var ang = e.rotation, a = e.fout();
    Draw.color(col("ffe08a"), col("ff5a1f"), e.fin());
    Angles.randLenVectors(e.id, 5 + Math.round(sc * 2), 2 + e.finpow() * 20 * sc, ang, 26, function(x, y){
      Fill.circle(e.x + x, e.y + y + e.fin() * 3, (1.4 + a * 2.2) * sc * 0.8);
    });
    Draw.color(cGrey, 0.15 * a);
    Angles.randLenVectors(e.id + 9, 2, 6 + e.finpow() * 14 * sc, ang, 40, function(x, y){
      Fill.circle(e.x + x, e.y + y + e.fin() * 4, (1 + e.fin() * 2.5) * sc);
    });
    Draw.color(col("ffb347"));
    Angles.randLenVectors(e.id + 2, 3, 4 + e.finpow() * 24 * sc, ang, 50, function(x, y){
      Fill.circle(e.x + x, e.y + y + e.fin() * 5, a * 0.9 + 0.2);
    });
    Drawf.light(e.x, e.y, 30 * sc * a, col("ff6a2a"), 0.5 * a);
  });
}

// Лазерные: длинная вспышка-луч, двойное кольцо, искры, сильное свечение
function makeLaserFx(sc){
  return new Effect(20 + sc * 4, 160, function(e){
    var ang = e.rotation, a = e.fout();
    Draw.color(e.color, Color.white, 0.5 * a);
    Draw.alpha(0.9 * a);
    Drawf.tri(e.x, e.y, 2.2 * sc * a, 22 * sc * a, ang);
    Drawf.tri(e.x, e.y, 1.5 * sc * a, 5 * sc * a, ang + 180);
    Draw.color(e.color);
    Draw.alpha(0.5 * a);
    Lines.stroke(a * 1.6);
    Lines.circle(e.x, e.y, 2 * sc + e.finpow() * 12 * sc);
    Lines.stroke(a * 0.8);
    Lines.circle(e.x, e.y, 1 + sc + e.finpow() * 7 * sc);
    Draw.color(Color.white, e.color, e.fin());
    Angles.randLenVectors(e.id, 4, 3 * sc + e.finpow() * 18 * sc, ang, 20, function(x, y){
      Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), a * 3 + 0.5);
    });
    Drawf.light(e.x, e.y, 34 * sc * a, e.color, 0.55 * a);
  });
}

// Электрические: ломаные молнии веером
function makeElectricFx(sc){
  return new Effect(18 + sc * 3, 140, function(e){
    var ang = e.rotation, a = e.fout();
    Draw.color(e.color, Color.white, 0.6 * a);
    Lines.stroke(a * 1.4 + 0.3);
    for(var k = 0; k < 3; k++){
      var px = e.x, py = e.y, dir = ang + (k - 1) * 22;
      for(var q = 0; q < 4; q++){
        var seg = (4 + q * 2.5) * sc * (0.6 + e.finpow() * 0.7);
        var nd = dir + Mathf.randomSeed(e.id * 13 + k * 7 + q, -35, 35);
        var nx = px + Angles.trnsx(nd, seg), ny = py + Angles.trnsy(nd, seg);
        Lines.line(px, py, nx, ny);
        px = nx; py = ny;
        dir = nd * 0.5 + ang * 0.5;
      }
    }
    Draw.color(e.color);
    Draw.alpha(0.5 * a);
    Fill.circle(e.x, e.y, (2 + a * 2) * sc);
    Drawf.light(e.x, e.y, 28 * sc * a, e.color, 0.5 * a);
  });
}

// Зенитки (flak): вращающаяся звезда, искры и дым
function makeFlakFx(sc){
  return new Effect(20 + sc * 4, 120, function(e){
    var ang = e.rotation, a = e.fout();
    Draw.color(Color.white, e.color, e.fin() * 0.7);
    Draw.alpha(0.9 * a);
    for(var i = 0; i < 4; i++){
      Drawf.tri(e.x, e.y, 1.8 * sc * a, 8 * sc * a, ang + i * 90 + e.fin() * 40);
    }
    Draw.color(e.color);
    Draw.alpha(0.45 * a);
    Lines.stroke(a * 1.1);
    Lines.circle(e.x, e.y, 2 * sc + e.finpow() * 8 * sc);
    Draw.color(cGold, e.color, e.fin());
    Angles.randLenVectors(e.id, 5, 3 * sc + e.finpow() * 16 * sc, ang, 35, function(x, y){
      Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), a * 3 + 0.4);
    });
    Draw.color(cGrey, 0.2 * a);
    Angles.randLenVectors(e.id + 4, 3, 2 + e.finpow() * 10 * sc, ang, 50, function(x, y){
      Fill.circle(e.x + x, e.y + y, (0.8 + e.fin() * 2) * sc);
    });
    Drawf.light(e.x, e.y, 26 * sc * a, e.color, 0.4 * a);
  });
}

// Ракетные: огненный выхлоп назад и густой дым
function makeMissileFx(sc){
  return new Effect(26 + sc * 5, 140, function(e){
    var ang = e.rotation, back = ang + 180, a = e.fout();
    Draw.color(col("ffd27a"), col("ff6a2a"), e.fin());
    Draw.alpha(0.9 * a);
    Drawf.tri(e.x, e.y, 2.4 * sc * a, 12 * sc * a, back);
    Draw.color(cGrey, 0.35 * a);
    Angles.randLenVectors(e.id, 4 + Math.round(sc * 2), 3 + e.finpow() * 20 * sc, back, 25, function(x, y){
      Fill.circle(e.x + x, e.y + y, (1 + e.fin() * 3) * sc);
    });
    Draw.color(Color.white, e.color, 0.5);
    Draw.alpha(0.9 * a);
    Drawf.tri(e.x, e.y, 1.5 * sc * a, 5 * sc * a, ang);
    Drawf.light(e.x, e.y, 24 * sc * a, col("ff8a3a"), 0.4 * a);
  });
}

// Жидкостные (волна, цунами): веер брызг и пузырьки цвета жидкости
function makeLiquidFx(sc){
  return new Effect(22 + sc * 4, 120, function(e){
    var ang = e.rotation, a = e.fout();
    Draw.color(e.color, Color.white, 0.2 * a);
    Draw.alpha(0.8 * a);
    Angles.randLenVectors(e.id, 6 + Math.round(sc * 3), 3 * sc + e.finpow() * 26 * sc, ang, 24, function(x, y){
      Fill.circle(e.x + x, e.y + y, a * 1.6 * sc + 0.3);
    });
    Draw.color(Color.white, 0.6 * a);
    Lines.stroke(a * 0.8);
    Lines.circle(e.x, e.y, 2 * sc + e.finpow() * 7 * sc);
  });
}

var styleOfTurret = {
  duo: "bullet", salvo: "bullet", spectre: "bullet", fuse: "bullet",
  breach: "bullet", diffuse: "bullet", smite: "bullet",
  hail: "artillery", ripple: "artillery", titan: "artillery",
  scatter: "flak", cyclone: "flak", disperse: "flak",
  swarmer: "missile", scathe: "missile",
  scorch: "flame", sublimate: "flame",
  wave: "liquid", tsunami: "liquid",
  lancer: "laser", meltdown: "laser", foreshadow: "laser", lustre: "laser", malign: "laser", parallax: "laser",
  arc: "electric", afflict: "electric"
};
var styleMakers = {
  artillery: makeArtilleryFx, flame: makeFlameFx, laser: makeLaserFx, electric: makeElectricFx,
  flak: makeFlakFx, missile: makeMissileFx, liquid: makeLiquidFx
};
var sizeScales = [1.1, 1.6, 2.3, 3.2];
var styleFx = {};
for(var sk in styleMakers){
  styleFx[sk] = [];
  for(var sz = 0; sz < 4; sz++) styleFx[sk].push(styleMakers[sk](sizeScales[sz]));
}

// Нарастающий заряд у лазерных турелей: частицы стягиваются к стволу
var chargeFx = new Effect(18, 100, function(e){
  var sc = Math.max(0.8, e.rotation);
  Draw.color(e.color, Color.white, e.fout() * 0.5);
  Angles.randLenVectors(e.id, 5, (1 - e.finpow()) * 16 * sc, function(x, y){
    Fill.circle(e.x + x, e.y + y, e.fin() * 1.8 + 0.3);
  });
  Draw.alpha(0.6);
  Lines.stroke(e.fin() * 1.2);
  Lines.circle(e.x, e.y, (1 - e.fin()) * 7 * sc);
  Drawf.light(e.x, e.y, 20 * sc * e.fin(), e.color, 0.5 * e.fin());
});

// Попадание снаряда: тонкое кольцо и несколько искр
var hitFx = new Effect(16, 60, function(e){
  Draw.color(e.color);
  Draw.alpha(0.8 * e.fout());
  Lines.stroke(e.fout() * 1.2);
  Lines.circle(e.x, e.y, 1.5 + e.finpow() * 6);
  Draw.color(Color.white, e.color, e.fin());
  Angles.randLenVectors(e.id, 4, 1 + 9 * e.finpow(), function(x, y){
    Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), e.fout() * 2.6 + 0.3);
  });
});


/* ===================== v1.7: ЭФФЕКТЫ ПУЛЬ ПОСЛЕ ВЫСТРЕЛА ===================== */

// Артиллерия: тлеющий огонёк и дымный шлейф
var smokeTrailFx = new Effect(38, 80, function(e){
  var a = e.fout();
  if(e.fin() < 0.35){
    Draw.color(col("ffd27a"), col("ff6a2a"), e.fin() * 2.8);
    Draw.alpha(0.8 * (1 - e.fin() * 2.8));
    Fill.circle(e.x, e.y, 1.6 + a * 1.6);
  }
  Draw.color(cGrey, 0.4 * a);
  Fill.circle(e.x + Mathf.sin(e.time * 0.2 + e.id) * 1.2, e.y + e.fin() * 5, 1.6 + e.fin() * 4.2);
});

// Зенитки: мерцающие искорки по ходу снаряда
var sparkleTrailFx = new Effect(22, 60, function(e){
  var a = e.fout();
  Draw.color(Color.white, e.color, e.fin());
  Angles.randLenVectors(e.id, 3, 1 + e.finpow() * 8, function(x, y){
    Fill.square(e.x + x, e.y + y, a * 1.7 + 0.2, 45 + e.fin() * 90);
  });
  Draw.color(e.color, 0.35 * a);
  Fill.circle(e.x, e.y, 1.6 * a + 0.4);
});

// Ракеты: огненное ядро и густой дым
var missileTrailFx = new Effect(30, 80, function(e){
  var a = e.fout();
  Draw.color(col("ffe2a0"), col("ff5a1f"), e.fin());
  Fill.circle(e.x, e.y, 1.2 + 2.2 * a * a);
  Draw.color(cGrey, 0.3 * a);
  Fill.circle(e.x + Angles.trnsx(e.rotation + 180, e.fin() * 4), e.y + Angles.trnsy(e.rotation + 180, e.fin() * 4), 1 + e.fin() * 3.5);
  Drawf.light(e.x, e.y, 14 * a, col("ff7a2a"), 0.35 * a);
});

// Попадание обычной пули: искры веером назад и вспышка
var sparkHitFx = new Effect(22, 80, function(e){
  var a = e.fout();
  Draw.color(Color.white, e.color, e.fin());
  Lines.stroke(a * 1.4 + 0.2);
  Angles.randLenVectors(e.id, 7, 2 + e.finpow() * 16, e.rotation + 180, 55, function(x, y){
    Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), a * 3.4 + 0.4);
  });
  Draw.color(e.color, 0.7 * a);
  Fill.circle(e.x, e.y, a * 3.2);
  Lines.stroke(a);
  Lines.circle(e.x, e.y, 1 + e.finpow() * 7);
  Drawf.light(e.x, e.y, 18 * a, e.color, 0.4 * a);
});

// Попадание взрывного снаряда: ударное кольцо, обломки, дым (e.rotation = радиус)
function makeBigBoom(R){ return new Effect(36, 200, function(e){
  var r = R, a = e.fout();
  Draw.color(Color.white, e.color, e.fin());
  Lines.stroke(a * 2.2);
  Lines.circle(e.x, e.y, r * 0.3 + e.finpow() * r * 0.8);
  Draw.alpha(0.5 * a);
  Fill.circle(e.x, e.y, r * 0.35 * a);
  Draw.color(cGold, e.color, e.fin());
  Lines.stroke(a * 1.4 + 0.3);
  Angles.randLenVectors(e.id, 9, r * 0.2 + e.finpow() * r * 0.9, function(x, y){
    Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), a * 5 + 0.6);
  });
  Draw.color(cGrey, 0.3 * a);
  Angles.randLenVectors(e.id + 4, 5, r * 0.15 + e.finpow() * r * 0.6, function(x, y){
    Fill.circle(e.x + x, e.y + y + e.fin() * 4, 1.5 + e.fin() * r * 0.12);
  });
  Drawf.light(e.x, e.y, r * 2.2 * a, e.color, 0.5 * a);
});
}
var bigBoomCache = {};
function bigBoomFor(rad){
  var key = Math.max(2, Math.round(Math.min(70, rad) / 8)) * 8;
  if(bigBoomCache[key] == null) bigBoomCache[key] = makeBigBoom(key);
  return bigBoomCache[key];
}

// Пуля иссякла в воздухе: тихое угасание
var fizzleFx = new Effect(18, 40, function(e){
  var a = e.fout();
  Draw.color(e.color, 0.7 * a);
  Angles.randLenVectors(e.id, 3, 1 + e.finpow() * 6, function(x, y){
    Fill.circle(e.x + x, e.y + y, a * 1.3);
  });
});

/* ---------- жидкости: всплески при попадании в лужи ---------- */

// Брызги: кольца и «корона» капель
var splashFx = new Effect(32, 80, function(e){
  var a = e.fout();
  Draw.color(e.color, Color.white, 0.3);
  Draw.alpha(0.8 * a);
  Lines.stroke(a * 1.6);
  Lines.circle(e.x, e.y, 2 + e.finpow() * 13);
  Lines.stroke(a);
  Lines.circle(e.x, e.y, 1 + e.finpow() * 7);
  Draw.color(Color.white, e.color, e.fin());
  Angles.randLenVectors(e.id, 9, 3 + e.finpow() * 11, function(x, y){
    Fill.circle(e.x + x, e.y + y + Math.sin(e.fin() * Math.PI) * 5, a * 1.7 + 0.3);
  });
});

// Пар (вода на шлак): белые клубы вверх и угасающие оранжевые искры
var steamFx = new Effect(56, 100, function(e){
  var a = e.fout();
  Draw.color(Color.white, col("cfd6e0"), e.fin());
  Draw.alpha(0.45 * a);
  Angles.randLenVectors(e.id, 7, 2 + e.finpow() * 10, function(x, y){
    Fill.circle(e.x + x, e.y + y + e.finpow() * 14, 2 + e.fin() * 5);
  });
  if(e.fin() < 0.5){
    Draw.color(cGold, col("ff4a1a"), e.fin() * 2);
    Angles.randLenVectors(e.id + 3, 6, 2 + e.finpow() * 18, function(x, y){
      Fill.circle(e.x + x, e.y + y + e.fin() * 6, a * 1.2);
    });
    Drawf.light(e.x, e.y, 22 * a, col("ff6a2a"), 0.4 * a);
  }
});

// «Бульк»: пузыри всплывают, раздуваются и лопаются кольцом
var bubbleFx = new Effect(46, 60, function(e){
  for(var k = 0; k < 4; k++){
    var ph = Mathf.randomSeed(e.id * 7 + k, 0, 0.35);
    var f = Mathf.clamp((e.fin() - ph) / (1 - ph));
    if(f <= 0) continue;
    var cx = e.x + Mathf.randomSeed(e.id * 5 + k, -5, 5);
    var cy = e.y + Mathf.randomSeed(e.id * 3 + k, -5, 5) + f * 3;
    var r = 1 + f * 2.6;
    if(f < 0.8){
      Draw.color(e.color, 0.8);
      Fill.circle(cx, cy, r);
      Draw.color(Color.white, 0.6 * (1 - f));
      Fill.circle(cx - r * 0.3, cy + r * 0.3, r * 0.35);
      Draw.color(col("8a6cff"), 0.6);
      Lines.stroke(0.6);
      Lines.circle(cx, cy, r);
    }else{
      var pf = (f - 0.8) / 0.2;
      Draw.color(Color.white, e.color, pf);
      Draw.alpha(1 - pf);
      Lines.stroke((1 - pf) * 1.1);
      Lines.circle(cx, cy, r + pf * 4);
    }
  }
});

var splashLast = -100;
function liquidHit(x, y, lq){
  var t = Vars.world.tileWorld(x, y);
  if(t == null || t.build != null) return false;
  var f = t.floor();
  if(f == null || !f.isLiquid || f.liquidDrop == null) return false;
  var fl = String(f.liquidDrop.name), bl = String(lq.name);
  var bc = lq.color;
  var now = Time.time;
  var canSound = (now - splashLast > 6 || now < splashLast);
  if(canSound) splashLast = now;
  var hot = (bl == "water" || bl == "cryofluid");
  if(fl == "slag"){
    if(hot){
      steamFx.at(x, y, 0, Color.white);
      steamFx.at(x + 2, y + 1, 0, Color.white);
      if(canSound){ snd("hiss", x, y, 0.95 + Mathf.random(0.15), 0.8); }
    }
    bubbleFx.at(x, y, 0, col("ff7a2a"));
    if(canSound) snd("bulk", x, y, 0.75 + Mathf.random(0.1), 0.8);
  }else if(fl == "oil"){
    bubbleFx.at(x, y, 0, col("2a2140"));
    rippleFx.at(x, y, 0, col("8a6cff"));
    if(hot) splashFx.at(x, y, 0, bc);
    if(canSound) snd("bulk", x, y, 0.85 + Mathf.random(0.15), 0.9);
  }else{
    splashFx.at(x, y, 0, bc);
    rippleFx.at(x, y, 0, col("bfe9ff"));
    if(canSound) snd("splash", x, y, 1 + Mathf.random(0.2), 0.7);
  }
  return true;
}

/* ---------- Испепелитель (Meltdown): красивый луч, геймплей не затронут ---------- */

var meltEmberFx = new Effect(34, 80, function(e){
  var a = e.fout();
  Draw.color(Color.white, col("ff7a2a"), e.fin());
  Lines.stroke(a * 1.3 + 0.2);
  Angles.randLenVectors(e.id, 5, 3 + e.finpow() * 22, e.rotation, 70, function(x, y){
    Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), a * 4 + 0.5);
  });
  Draw.color(cGrey, 0.25 * a);
  Angles.randLenVectors(e.id + 2, 3, 2 + e.finpow() * 12, e.rotation, 60, function(x, y){
    Fill.circle(e.x + x, e.y + y + e.fin() * 5, 1.5 + e.fin() * 3);
  });
});

// Выжженная земля под точкой попадания
var scorchFx = new Effect(70, 40, function(e){
  var a = e.fout();
  Draw.color(col("140a06"), 0.35 * a);
  Fill.circle(e.x, e.y, 5 + e.fin() * 4);
  Draw.color(col("ff5a1f"), 0.4 * a * a);
  Fill.circle(e.x, e.y, 3 * a);
});

var ContLaser = Packages.mindustry.entities.bullet.ContinuousLaserBulletType;
var LaserBullet = Packages.mindustry.entities.bullet.LaserBulletType;
var LiquidBulletClass = Packages.mindustry.entities.bullet.LiquidBulletType;
var ArtilleryBulletClass = Packages.mindustry.entities.bullet.ArtilleryBulletType;
var MissileBulletClass = Packages.mindustry.entities.bullet.MissileBulletType;
var FlakBulletClass = Packages.mindustry.entities.bullet.FlakBulletType;
var LightningBulletClass = Packages.mindustry.entities.bullet.LightningBulletType;
var DamageClass = Packages.mindustry.entities.Damage;
var AdditiveBlend = Packages.arc.graphics.Blending.additive;
var LayerClass = Packages.mindustry.graphics.Layer;

var lenOk = true, lightOk = true;
function beamLen(b){
  var L = b.type.length;
  if(!lenOk) return L;
  try{ return DamageClass.findLaserLength(b, L); }catch(err){ lenOk = false; return L; }
}

var meltTuned = {};
function tuneMelt(ty){
  var key = String(ty.hashCode());
  if(meltTuned[key]) return;
  meltTuned[key] = true;
  try{
    var c = ty.colors;
    if(c != null && c.length >= 4){
      c[0].set(col("d6223f66"));
      c[1].set(col("ff5a2abb"));
      c[2].set(col("ffc15a"));
      c[3].set(col("fffbe8"));
    }
  }catch(err){ fail("цвета луча", err); }
}

var cHaze = col("ff2a1a"), cHaze2 = col("ff7a2a"), cHot = col("ffb347"), cWhiteHot = col("fff4d6"),
    cHelixA = col("ff6a2a"), cHelixB = col("ffe9a8");

function drawMeltBeam(b){
  var t = Time.time, ang = b.rotation(), x = b.x, y = b.y;
  var len = beamLen(b);
  var fade = Mathf.clamp(Math.min(b.time / 10, (b.lifetime - b.time) / 16));
  if(fade <= 0.01) return;
  var dx = Mathf.cosDeg(ang), dy = Mathf.sinDeg(ang), px = -dy, py = dx;
  var ex = x + dx * len, ey = y + dy * len, seed = b.id;
  var pulse = 0.9 + 0.1 * Math.sin(t * 0.3);

  Draw.blend(AdditiveBlend);
  // плазменная дымка вокруг луча
  Draw.color(cHaze, 0.10 * fade);
  Lines.stroke(26 * fade * pulse);
  Lines.line(x, y, ex, ey);
  Draw.color(cHaze2, 0.12 * fade);
  Lines.stroke(15 * fade * pulse);
  Lines.line(x, y, ex, ey);

  // тройная спираль вокруг луча
  var segs = Math.max(8, Math.floor(len / 7));
  for(var s = 0; s < 3; s++){
    var phase = s * 2.0944;
    var lx = x, ly = y;
    for(var k = 1; k <= segs; k++){
      var d = k / segs * len;
      var env = Mathf.clamp(d / 40) * (0.75 + 0.25 * Math.sin(d * 0.02 - t * 0.1));
      var arg = d * 0.085 - t * 0.42 + phase;
      var w = Math.sin(arg) * 6.5 * env * fade;
      var nx = x + dx * d + px * w, ny = y + dy * d + py * w;
      var depth = (Math.cos(arg) + 1) / 2;
      Draw.color(cHelixA, cHelixB, depth);
      Draw.alpha(0.35 + 0.45 * depth);
      Lines.stroke((0.9 + 1.1 * depth) * fade);
      Lines.line(lx, ly, nx, ny);
      lx = nx; ly = ny;
    }
  }

  // летящие вдоль луча угольки
  for(var q = 0; q < 16; q++){
    var f = ((t * 0.011 * (0.8 + (q % 4) * 0.15) + q * 0.0625 + (seed % 7) * 0.13) % 1);
    var dd = f * len;
    var off = Math.sin(q * 12.9 + t * 0.05) * (3 + 5 * (q % 3)) * Mathf.clamp(dd / 30);
    Draw.color(cHot, cWhiteHot, (q % 3) / 2);
    Draw.alpha(0.85 * fade);
    Fill.circle(x + dx * dd + px * off, y + dy * dd + py * off, (1 + (q % 3) * 0.5) * fade * (1 - f * 0.4));
  }

  // бегущие «стрелки» энергии
  for(var r = 0; r < 4; r++){
    var f2 = ((t * 0.02 + r * 0.25) % 1);
    var cx = x + dx * len * f2, cy = y + dy * len * f2;
    var wd = 9 * fade * (0.5 + Math.sin(f2 * Math.PI) * 0.5);
    Draw.color(cHot, 0.5 * (1 - f2) * fade);
    Lines.stroke(1.2);
    Lines.line(cx + dx * 3, cy + dy * 3, cx + px * wd - dx * 4, cy + py * wd - dy * 4);
    Lines.line(cx + dx * 3, cy + dy * 3, cx - px * wd - dx * 4, cy - py * wd - dy * 4);
  }

  // вспышка у ствола
  Draw.color(cWhiteHot, 0.8 * fade);
  Fill.circle(x, y, 5 * fade * pulse);
  Draw.color(cHot, 0.5 * fade);
  for(var i = 0; i < 4; i++){
    Drawf.tri(x, y, 3 * fade, 18 * fade * pulse, t * 3 + i * 90);
  }
  var f3 = (t * 0.1) % 1;
  Lines.stroke(1.4 * (1 - f3) * fade);
  Draw.color(cHot, (1 - f3) * 0.7 * fade);
  Lines.circle(x, y, 6 + f3 * 14);

  // точка попадания: звезда, кольца, искры
  Draw.color(cHot, 0.55 * fade);
  Fill.circle(ex, ey, 9 * fade * pulse);
  Draw.color(Color.white, 0.9 * fade);
  Fill.circle(ex, ey, 4.2 * fade * pulse);
  Draw.color(cHot, 0.6 * fade);
  for(var j = 0; j < 6; j++){
    Drawf.tri(ex, ey, 2.5 * fade, (16 + (j % 2) * 10) * fade * pulse, t * 2.4 * ((j % 2) ? -1 : 1) + j * 60);
  }
  var f4 = (t * 0.09) % 1;
  Lines.stroke(1.5 * (1 - f4) * fade);
  Draw.color(cHaze2, (1 - f4) * 0.8 * fade);
  Lines.circle(ex, ey, 6 + f4 * 22);
  var tk = Math.floor(t / 3);
  Draw.color(Color.white, cHot, 0.4);
  Draw.alpha(0.9 * fade);
  Lines.stroke(1.1 * fade);
  for(var m = 0; m < 8; m++){
    var a2 = Mathf.randomSeed(seed * 17 + m + tk * 31, 0, 360);
    var l2 = Mathf.randomSeed(seed * 13 + m + tk * 29, 3, 10);
    Lines.lineAngle(ex + Mathf.cosDeg(a2) * 3, ey + Mathf.sinDeg(a2) * 3, a2, l2);
  }
  Draw.blend();

  if(lightOk){
    try{ Drawf.light(x, y, ex, ey, 40 * fade, cHaze2, 0.7 * fade); }catch(err){ lightOk = false; }
  }
}

function drawMeltdown(){
  var n = Groups.bullet.size();
  if(n > 800) return;
  var z0 = Draw.z();
  Draw.z(LayerClass.bullet + 3);
  for(var i = 0; i < n; i++){
    var b = Groups.bullet.index(i);
    if(b == null) continue;
    var ty = b.type;
    if(!(ty instanceof ContLaser)) continue;
    var o = b.owner;
    if(o == null || !(o instanceof BuildingClass) || String(o.block.name) != "meltdown") continue;
    tuneMelt(ty);
    drawMeltBeam(b);
  }
  Draw.blend();
  Draw.z(z0);
  Draw.reset();
}

var waveFx = new Effect(70, 300, function(e){
  Draw.color(cRed, Color.white, e.fout() * 0.4);
  Lines.stroke(e.fout() * 3);
  Lines.circle(e.x, e.y, 10 + e.finpow() * 90);
  Lines.stroke(e.fout() * 2);
  Lines.circle(e.x, e.y, 5 + e.finpow() * 50);
  Draw.alpha(e.fout() * 0.6);
  Fill.rect(e.x, e.y + e.finpow() * 60, 6 * e.fout(), 140 * e.fout());
  Drawf.light(e.x, e.y, 120 * e.fout(), cRed, 0.8 * e.fout());
});

var emberFx = new Effect(90, 40, function(e){
  Draw.color(col("ffd27a"), col("ff4a1a"), e.fin());
  var rise = e.finpow() * 14, sway = Mathf.sin(e.time * 0.12 + e.id) * 2.2;
  Fill.circle(e.x + sway, e.y + rise, 0.7 + e.fout() * 1.3);
  Drawf.light(e.x + sway, e.y + rise, 10 + e.fout() * 10, col("ff5a1f"), 0.45 * e.fout());
});

var oilFx = new Effect(70, 30, function(e){
  var r = 1 + e.fin() * 3.2;
  Draw.color(col("1a1426"), 0.85);
  Fill.circle(e.x, e.y, r);
  Draw.color(col("8a6cff"), 0.5);
  Lines.stroke(0.7);
  Lines.circle(e.x, e.y, r);
  if(e.fin() > 0.8){
    Draw.color(col("8a6cff"), (1 - e.fin()) * 5);
    Lines.stroke(1);
    Lines.circle(e.x, e.y, r + (e.fin() - 0.8) * 30);
  }
});

var rippleFx = new Effect(60, 40, function(e){
  Draw.color(e.color, e.fout() * 0.55);
  Lines.stroke(0.8 + e.fout());
  Lines.circle(e.x, e.y, 1 + e.finpow() * 9);
  Draw.color(Color.white, Mathf.clamp(1 - e.fin() * 3));
  Fill.circle(e.x, e.y, 0.8);
});


/* ===================== v1.8: ЖИДКОСТИ ===================== */

// Блик на воде: мерцающая звёздочка
var glintFx = new Effect(46, 30, function(e){
  var a = Math.sin(e.fin() * Math.PI);
  Draw.color(Color.white, e.color, 0.35);
  Draw.alpha(0.9 * a);
  Lines.stroke(0.9);
  var l = 2 + 4.5 * a;
  Lines.line(e.x - l, e.y, e.x + l, e.y);
  Lines.line(e.x, e.y - l, e.x, e.y + l);
  Fill.circle(e.x, e.y, 0.9 * a);
});
// Двойная волна на воде
var swellFx = new Effect(80, 60, function(e){
  var a = e.fout();
  Draw.color(e.color, Color.white, 0.3);
  Draw.alpha(0.4 * a);
  Lines.stroke(1.1 * a + 0.2);
  Lines.circle(e.x, e.y, 2 + e.finpow() * 14);
  Draw.alpha(0.25 * a);
  Lines.circle(e.x, e.y, 1 + e.finpow() * 8);
});
// Пузырь шлака: раздувается, лопается, выбрасывает искры
var slagPopFx = new Effect(56, 60, function(e){
  var f = e.fin();
  if(f < 0.7){
    var r = 1 + f / 0.7 * 3.2;
    Draw.color(col("ff6a1a"), col("ffd27a"), f);
    Draw.alpha(0.85);
    Fill.circle(e.x, e.y, r);
    Draw.color(Color.white, 0.5 * (1 - f));
    Fill.circle(e.x - r * 0.3, e.y + r * 0.3, r * 0.3);
    Drawf.light(e.x, e.y, 14 + r * 3, col("ff6a1a"), 0.35);
  }else{
    var pf = (f - 0.7) / 0.3;
    Draw.color(cGold, col("ff4a1a"), pf);
    Lines.stroke((1 - pf) * 1.2);
    Lines.circle(e.x, e.y, 4 + pf * 6);
    Angles.randLenVectors(e.id, 5, 2 + pf * 14, function(x, y){
      Fill.circle(e.x + x, e.y + y + pf * 5, (1 - pf) * 1.5);
    });
  }
});
// Кристальный блик криожидкости: шестилучевая снежинка
var frostGlintFx = new Effect(60, 30, function(e){
  var a = Math.sin(e.fin() * Math.PI);
  Draw.color(Color.white, e.color, 0.4);
  Draw.alpha(0.85 * a);
  Lines.stroke(0.8);
  var l = 2 + 4 * a;
  for(var i = 0; i < 3; i++){
    Lines.lineAngle(e.x, e.y, i * 60, l);
    Lines.lineAngle(e.x, e.y, i * 60 + 180, l);
  }
  Fill.circle(e.x, e.y, 0.8 * a);
});

/* ===================== СОБЫТИЯ ===================== */

var pending = {};

Events.on(EventType.BlockBuildBeginEvent, function(e){
  guard("стройка", function(){
    if(!e.breaking) return;
    var b = e.tile.build, s = 1, x = e.tile.worldx(), y = e.tile.worldy();
    if(b != null){
      x = b.x; y = b.y;
      if(b.previous != null) s = b.previous.size;
    }
    pending[e.tile.pos()] = {x: x, y: y, s: s};
  });
});

Events.on(EventType.BlockBuildEndEvent, function(e){
  guard("стройка", function(){
    if(e.breaking){
      var k = e.tile.pos();
      var p = pending[k];
      delete pending[k];
      if(!p) p = {x: e.tile.worldx(), y: e.tile.worldy(), s: 1};
      breakFx.at(p.x, p.y, p.s);
      snd("break", p.x, p.y, 1.0 + Mathf.random(0.15), 0.8);
    }else{
      var blk = e.tile.block();
      var x = e.tile.drawx(), y = e.tile.drawy();
      buildFx.at(x, y, blk.size);
      snd("place", x, y, 0.9 + Mathf.random(0.2), 0.9);
      
    }
  });
});

Events.on(EventType.UnitDestroyEvent, function(e){
  guard("смерть юнита", function(){
    var u = e.unit;
    if(u == null) return;
    var enemy = u.team.id != Vars.player.team().id;
    if(enemy){
      deathFx.at(u.x, u.y, u.hitSize, cOrange);
      Effect.shake(Math.min(6, u.hitSize / 8), 10, u.x, u.y);
      snd("boom", u.x, u.y, 1.2 - Math.min(0.5, u.hitSize / 80), 0.9);
      snd("spark", u.x, u.y, 0.8, 0.5);
    }else{
      deathFx.at(u.x, u.y, u.hitSize * 0.6, cCyan);
      snd("explosion", u.x, u.y, 1.0, 0.5);
    }
  });
});

Events.on(EventType.WaveEvent, function(e){
  guard("волна", function(){
    Vars.spawner.getSpawns().each(function(t){
      waveFx.at(t.worldx(), t.worldy());
      snd("wave", t.worldx(), t.worldy(), 1, 0.7);
    });
  });
});

/* ===== Слежение за снарядами турелей и новыми юнитами =====
   Не зависит от внутренних полей турелей: смотрим на сами объекты в мире. */

var TurretClass = Packages.mindustry.world.blocks.defense.turrets.Turret;
var BuildingClass = Packages.mindustry.gen.Building;

var prevB = {};
var diag = {frames: 0, all: 0, build: 0, turret: 0, flashes: 0, hits: 0, hpTr: 0, hpNums: 0, hpSample: "-"};
var prevU = {};
var lastFlash = {};
var lightApplied = false;
var unitsPrimed = false;

var frameNo = 0;

function bulletKind(ty){
  if(ty instanceof LiquidBulletClass) return "liquid";
  if(ty instanceof ContLaser) return "cont";
  if(ty instanceof LaserBullet) return "beam";
  if(ty instanceof LightningBulletClass) return "lightning";
  if(ty instanceof ArtilleryBulletClass) return "artillery";
  if(ty instanceof MissileBulletClass) return "missile";
  if(ty instanceof FlakBulletClass) return "flak";
  return "basic";
}

function trackBullets(){
  var n = Groups.bullet.size();
  var cap = qLevel() == 0 ? 160 : (qLevel() == 1 ? 280 : 400);
  var cur = {}, nextPrev = {};
  var truncated = n > cap;
  var lim = Math.min(n, cap);
  var now = Time.time;
  var nB = 0, nT = 0;
  var trails = pref("vo-bulletfx", true), melt = pref("vo-meltfx", true), splash = pref("vo-splash", true);
  var trailBudget = Math.round(40 * qm());
  frameNo++;
  for(var i = 0; i < lim; i++){
    var b = Groups.bullet.index(i);
    if(b == null) continue;
    var ty = b.type;
    if(ty == null) continue;
    var o = b.owner;
    var fromBuild = (o != null && (o instanceof BuildingClass));
    var fromTurret = fromBuild && (o.block instanceof TurretClass);
    var kind = bulletKind(ty);
    if(!fromTurret && kind != "liquid") continue;
    if(fromBuild) nB++;
    if(fromTurret) nT++;
    var id = b.id;
    cur[id] = true;
    var hc = ty.hitColor;
    if(hc == null) hc = Color.white;
    var isNew = (prevB[id] == null);

    if(fromTurret && isNew){
      var oid = o.id;
      var last = lastFlash[oid];
      if((last == null || now - last >= 6 || now < last) && (qLevel() > 0 || frameNo % 2 == 0)){
        lastFlash[oid] = now;
        var idx = Math.max(0, Math.min(3, o.block.size - 1));
        var tname = String(o.block.name);
        var st = styleOfTurret[tname];
        var fx = (st != null && styleFx[st] != null) ? styleFx[st][idx] : gunFxs[idx];
        fx.at(b.x, b.y, b.rotation(), hc);
        diag.flashes++;
        if(st == "artillery" && idx >= 2) Effect.shake(1.2, 8, b.x, b.y);
      }
    }

    if(melt && kind == "cont" && fromTurret && String(o.block.name) == "meltdown" && (id + frameNo) % 2 == 0){
      var L = beamLen(b), ang = b.rotation();
      var ex = b.x + Angles.trnsx(ang, L), ey = b.y + Angles.trnsy(ang, L);
      meltEmberFx.at(ex, ey, ang + 180, cHot);
      if((id + frameNo) % 10 == 0) scorchFx.at(ex, ey, 0, cHot);
    }

    nextPrev[id] = {x: b.x, y: b.y, c: hc, big: ty.splashDamageRadius > 16, rad: ty.splashDamageRadius,
      kind: kind, rot: b.rotation(), fin: b.fin(), liq: (kind == "liquid" ? ty.liquid : null), turret: fromTurret};
  }
  if(!truncated){
    var splashes = 4;
    for(var k in prevB){
      if(cur[k] != null) continue;
      var p = prevB[k];
      if(p.kind == "liquid"){
        if(splash && splashes > 0 && p.liq != null && liquidHit(p.x, p.y, p.liq)) splashes--;
        continue;
      }
    }
  }
  prevB = nextPrev;
  diag.frames++;
  if(n > diag.all) diag.all = n;
  if(nB > diag.build) diag.build = nB;
  if(nT > diag.turret) diag.turret = nT;
}

var BlockFlagClass = Packages.mindustry.world.meta.BlockFlag;
var chargeTick = 0;
function trackCharge(){
  chargeTick++;
  if(chargeTick % 3 != 0) return;
  var ts = Vars.indexer.getFlagged(Vars.player.team(), BlockFlagClass.turret);
  var n = Math.min(ts.size, 60);
  for(var i = 0; i < n; i++){
    var t = ts.get(i);
    if(t == null || !(t.block instanceof TurretClass)) continue;
    if(styleOfTurret[String(t.block.name)] != "laser") continue;
    if(t.target == null) continue;
    var p = t.reloadCounter / Math.max(1, t.block.reload);
    if(p < 0.4 || p > 0.99) continue;
    var off = t.block.size * 4 + 2;
    chargeFx.at(t.x + Angles.trnsx(t.rotation, off), t.y + Angles.trnsy(t.rotation, off), t.block.size * 0.9, cCyan);
  }
}

function trackUnits(){
  var n = Groups.unit.size();
  var cur = {}, made = 0;
  var myTeam = Vars.player.team().id;
  for(var i = 0; i < n; i++){
    var u = Groups.unit.index(i);
    if(u == null) continue;
    var id = u.id;
    cur[id] = true;
    if(unitsPrimed && prevU[id] !== true && made < 8){
      made++;
      spawnFx.at(u.x, u.y, u.hitSize, u.team.color);
      if(made <= 2 && u.team.id == myTeam){
        snd("spawn", u.x, u.y, 1 + Mathf.random(0.1), 0.6);
      }
    }
  }
  prevU = cur;
  unitsPrimed = true;
}

function ambient(){
  var cam = Core.camera;
  var qmv = qm();
  for(var i = 0; i < 4; i++){
    if(!Mathf.chance(0.14 * qmv * Time.delta)) continue;
    var x = cam.position.x + Mathf.range(cam.width / 2);
    var y = cam.position.y + Mathf.range(cam.height / 2);
    var t = Vars.world.tileWorld(x, y);
    if(t == null || t.build != null) continue;
    var f = t.floor();
    if(!f.isLiquid || f.liquidDrop == null) continue;
    var nm = String(f.liquidDrop.name);
    var r = Mathf.random();
    if(nm == "slag"){
      if(r < 0.45) emberFx.at(x, y);
      else slagPopFx.at(x, y);
    }else if(nm == "oil"){
      if(r < 0.6) oilFx.at(x, y);
      else bubbleFx.at(x, y, 0, col("2a2140"));
    }else if(nm == "water"){
      if(r < 0.4) rippleFx.at(x, y, 0, col("bfe9ff"));
      else if(r < 0.75) glintFx.at(x, y, 0, col("e8fbff"));
      else swellFx.at(x, y, 0, col("8fd8ff"));
    }else if(nm == "cryofluid"){
      if(r < 0.5) frostGlintFx.at(x, y, 0, cCyan);
      else rippleFx.at(x, y, 0, cCyan);
    }
  }
}

Events.run(EventType.Trigger.update, function(){
  if(Vars.headless || !Vars.state.isGame() || Vars.state.isPaused()) return;
  guard("освещение", applyLighting);
  if(pref("vo-ambient", true)) guard("жидкости", ambient);
  if(pref("vo-turretfx", true)){
    guard("турели", trackBullets);
    guard("заряд лазеров", trackCharge);
  }
  guard("юниты", trackUnits);
});

/* Динамический свет: юниты светятся цветом команды */
Events.run(EventType.Trigger.draw, function(){
  if(Vars.state.isGame() && pref("vo-meltfx", true)) guard("луч испепелителя", drawMeltdown);
  guard("свет", function(){
    if(!Vars.state.rules.lighting || !pref("vo-lightfx", true)) return;
    Groups.unit.each(function(u){
      Drawf.light(u.x, u.y, u.hitSize * 2.2 + 14, u.team.color, 0.28);
    });
  });
});

/* Освещение: правила карты игра выставляет уже после WorldLoadEvent,
   поэтому применяем один раз в первом кадре игры */
function applyLighting(){
  if(lightApplied) return;
  lightApplied = true;
  if(!pref("vo-lighting", false)) return;
  var r = Vars.state.rules;
  if(!r.lighting){
    r.lighting = true;
    r.ambientLight.set(0.03, 0.04, 0.09, Core.settings.getInt("vo-dark", 40) / 100);
  }
}

Events.on(EventType.WorldLoadEvent, function(e){
  prevB = {};
  prevU = {};
  lastFlash = {};
  unitsPrimed = false;
  lightApplied = false;
});

/* ===================== ОКНО "СЛЕДУЮЩАЯ ВОЛНА" ===================== */

var orbitIcons = [];
var stars = [];
for(var si = 0; si < 80; si++){
  stars.push([Math.random(), Math.random(), Math.random() * 6.28, 0.6 + Math.random() * 1.4]);
}

function waveEntries(idx){
  var out = [];
  try{
    Vars.state.rules.spawns.each(function(g){
      var n = g.getSpawned(idx);
      if(n > 0) out.push({type: g.type, n: n, shield: g.getShield(idx), effect: g.effect});
    });
  }catch(err){}
  return out;
}

function effName(en){
  if(en.effect == null || en.effect == undefined) return "";
  if(String(en.effect.name) == "none") return "";
  return en.effect.localizedName;
}

var view = extend(Packages.arc.scene.Element, {
  draw: function(){
    var self = this;
    var w = self.width, h = self.height, t = Time.time;
    var cx = self.x + w / 2, cy = self.y + h * 0.74;
    var r = Math.min(w * 0.17, h * 0.2);
    var hue = (Vars.state.wave * 37) % 360;
    var dark = new Color().fromHsv(hue, 0.7, 0.25);
    var light = new Color().fromHsv((hue + 20) % 360, 0.35, 1);
    var mid = new Color().fromHsv(hue, 0.6, 0.7);

    Draw.color(col("04070f"));
    Fill.rect(self.x + w / 2, self.y + h / 2, w, h);
    for(var q = 0; q < 6; q++){
      Draw.color(col("3b2a6e"), 0.04);
      Fill.circle(self.x + w * 0.2, self.y + h * 0.8, w * (0.1 + q * 0.04));
      Draw.color(col("1d4a7a"), 0.04);
      Fill.circle(self.x + w * 0.85, self.y + h * 0.6, w * (0.08 + q * 0.035));
    }
    for(var s = 0; s < stars.length; s++){
      var st = stars[s];
      Draw.color(Color.white, 0.3 + 0.7 * Math.abs(Math.sin(t * 0.03 * st[3] + st[2])));
      Fill.circle(self.x + st[0] * w, self.y + st[1] * h, st[3]);
    }

    var rx = r * 1.9, ry = r * 0.5, n = orbitIcons.length;

    function orbitHalf(front){
      Lines.stroke(1);
      Draw.color(Color.white, 0.14);
      for(var a = 0; a < 48; a++){
        var a1 = a / 48 * 6.2832, a2 = (a + 1) / 48 * 6.2832;
        if((Math.sin(a1) < 0) != front) continue;
        Lines.line(cx + Math.cos(a1) * rx, cy + Math.sin(a1) * ry,
                   cx + Math.cos(a2) * rx, cy + Math.sin(a2) * ry);
      }
    }
    function drawIcons(front){
      for(var i = 0; i < n; i++){
        var ang = t * 0.012 * (0.7 + 0.15 * i) + i * 6.2832 / Math.max(1, n);
        var isFront = Math.sin(ang) < 0;
        if(isFront != front) continue;
        var px = cx + Math.cos(ang) * rx, py = cy + Math.sin(ang) * ry;
        var sz = 28 * (1 + 0.3 * (-Math.sin(ang)));
        Draw.color(light, 0.3);
        Fill.circle(px, py, sz * 0.7);
        Draw.color(Color.white);
        Draw.rect(orbitIcons[i], px, py, sz, sz);
      }
    }

    orbitHalf(false);
    drawIcons(false);

    for(var k = 0; k < 8; k++){
      Draw.color(light, 0.05);
      Fill.circle(cx, cy, r * (1.05 + k * 0.05));
    }
    for(var j = 0; j < 22; j++){
      var f = j / 21;
      Draw.color(dark, light, f);
      Fill.circle(cx - r * 0.3 * f, cy + r * 0.3 * f, r * (1 - 0.85 * f));
    }
    for(var m = 0; m < 8; m++){
      var lon = t * 0.006 + m * 0.9;
      var lat = (((m * 53) % 100) / 100 - 0.5) * 1.8;
      var z = Math.cos(lat) * Math.cos(lon);
      if(z <= 0.1) continue;
      var px2 = cx + Math.cos(lat) * Math.sin(lon) * r * 0.9;
      var py2 = cy + Math.sin(lat) * r * 0.9;
      Draw.color(mid, 0.4 * z);
      Fill.circle(px2, py2, r * (0.1 + 0.06 * (m % 3)) * z);
    }
    Lines.stroke(2);
    Draw.color(light, 0.4);
    Lines.circle(cx, cy, r);

    orbitHalf(true);
    drawIcons(true);
    Draw.reset();
  }
});

var list = new Packages.arc.scene.ui.layout.Table();
var lastWave = -1;

function entryRow(en){
  list.table(Styles.black6, function(row){
    row.left();
    row.image(en.type.uiIcon).size(40).pad(4);
    var txt = "[white]" + en.type.localizedName + " [accent]x" + en.n;
    if(en.shield > 0) txt += " [sky]щит " + Math.round(en.shield);
    var ef = effName(en);
    if(ef != "") txt += " [scarlet]" + ef;
    row.add(txt).left().growX().pad(4);
  }).growX().pad(2).row();
}

function rebuild(){
  list.clear();
  list.top();
  orbitIcons = [];
  var wave = Vars.state.wave;
  var cur = waveEntries(wave - 1);

  list.add("[accent]Следующая волна: " + wave).pad(6).row();
  list.label(function(){
    if(!Vars.state.rules.waveTimer) return "[lightgray]Волна запускается вручную";
    return "[lightgray]Через: " + Math.max(0, Math.ceil(Vars.state.wavetime / 60)) + " с";
  }).row();

  if(cur.length == 0){
    list.add("[lightgray]Врагов в этой волне нет").pad(10).row();
  }
  var seen = {};
  for(var i = 0; i < cur.length; i++){
    entryRow(cur[i]);
    var nm = String(cur[i].type.name);
    if(!seen[nm] && orbitIcons.length < 8){
      seen[nm] = true;
      orbitIcons.push(cur[i].type.uiIcon);
    }
  }

  list.add("[lightgray]Далее").pad(6).row();
  for(var d = 1; d <= 4; d++){
    (function(d){
      var es = waveEntries(wave - 1 + d);
      list.table(Styles.black6, function(row){
        row.left();
        row.add("[lightgray]Волна " + (wave + d) + "  ").pad(4);
        if(es.length == 0) row.add("[gray]-").pad(4);
        for(var k = 0; k < es.length; k++){
          row.image(es[k].type.uiIcon).size(24).pad(2);
          row.add("[accent]x" + es[k].n + " ").pad(2);
        }
      }).growX().pad(2).row();
    })(d);
  }
}

var waveDialog = null;
function buildDialog(){
  waveDialog = new Packages.mindustry.ui.dialogs.BaseDialog("Следующая волна");
  waveDialog.addCloseButton();

  list.update(function(){
    if(lastWave != Vars.state.wave){
      lastWave = Vars.state.wave;
      guard("окно волн", rebuild);
    }
  });

  var stack = new Packages.arc.scene.ui.layout.Stack();
  stack.add(view);

  var over = new Packages.arc.scene.ui.layout.Table();
  over.bottom();
  var pane = new Packages.arc.scene.ui.ScrollPane(list);
  pane.setScrollingDisabled(true, false);
  over.add(pane).growX().height(Math.max(200, Core.graphics.getHeight() * 0.4));
  stack.add(over);

  waveDialog.cont.add(stack).grow();
  waveDialog.shown(function(){
    lastWave = -1;
    snd("click", 0, 0, 1, 1);
  });
}

function openWaves(){
  guard("окно волн", function(){
    if(waveDialog == null) buildDialog();
    waveDialog.show();
  });
}

function showDiag(){
  var errs = Object.keys(errShown).map(function(k){ return k + " [" + errShown[k] + "]"; }).join("; ");
  var txt = "Версия: " + VO_VERSION +
    "\nСнарядов в мире (макс.): " + diag.all +
    "\nИз них от зданий: " + diag.build +
    "\nИз них от турелей: " + diag.turret +
    "\nВспышек выстрела: " + diag.flashes +
    "\nПопаданий: " + diag.hits +
    "\nКадров слежения: " + diag.frames +
    "\nЗдоровье: отслеживается " + diag.hpTr + ", цифр показано " + diag.hpNums + ", образец здания: " + diag.hpSample +
    "\nИнтерфейс: применено " + uiStat.ok + ", пропущено " + uiStat.fail + (uiStat.failNames.length > 0 ? " (" + uiStat.failNames.join(", ") + ")" : "") +
    "\nСтандартная панель волн скрыта (элементов): " + waveS.n +
    "\nОшибки: " + (errs == "" ? "нет" : errs);
  Vars.ui.showInfoText("Диагностика Visual Overhaul", txt);
}

function addHud(){
  // Group.fill(function) неоднозначен в Rhino (Cons / DrawRect), поэтому строим таблицу напрямую.
  // Element.visible - и поле, и метод; в Rhino доступно поле, поэтому видимость задаём через update.
  var t = new Packages.arc.scene.ui.layout.Table();
  t.name = "vo-waves";
  t.setFillParent(true);
  t.touchable = Packages.arc.scene.event.Touchable.childrenOnly;
  t.left();
  t.button("Волны", function(){ openWaves(); }).size(120, 50).padLeft(4).row();
  t.update(function(){
    t.visible = Vars.state.isGame();   // кнопки доступны в любой игре: после захвата сектора и на картах без волн правило waves выключено
  });
  Vars.ui.hudGroup.addChild(t);

  // кнопка диагностики (кнопки «Эффекты» больше нет)
  try{
    var b2 = t.button("Диагностика", function(){ guard("диагностика", showDiag); }).size(120, 44).padLeft(4).padTop(4).get();
    b2.update(function(){ b2.visible = pref("vo-debug", true); });
  }catch(err){
    fail("кнопка диагностики", err);
  }
}

function addSettings(){
  Vars.ui.settings.addCategory("Visual Overhaul", function(t){
    t.checkPref("vo-ui", true);
    t.sliderPref("vo-uitheme", 0, 0, 6, 1, function(i){ return UiThemes[i].name; });
    t.checkPref("vo-uianim", true);
    t.checkPref("vo-newmenu", true);
    t.checkPref("vo-res", true);
    t.sliderPref("vo-ressize", 50, 30, 150, 5, function(i){ return i + "%"; });
    t.sliderPref("vo-rescols", 6, 2, 10, 1, function(i){ return "" + i; });
    t.checkPref("vo-ambient", true);
    t.checkPref("vo-turretfx", true);
    t.checkPref("vo-bulletfx", true);
    t.checkPref("vo-meltfx", true);
    t.checkPref("vo-splash", true);
    t.checkPref("vo-planetfx", true);
    t.checkPref("vo-menufx", true);
    t.checkPref("vo-debug", true);
    t.sliderPref("vo-quality", 2, 0, 2, 1, function(i){ return i == 0 ? "Низкое" : (i == 1 ? "Среднее" : "Высокое"); });
    t.checkPref("vo-domefx", true);
    t.checkPref("vo-weatherfx", true);
    t.checkPref("vo-lightning", true);
    t.checkPref("vo-trails", true);
    t.checkPref("vo-hpbars", true);
    t.checkPref("vo-dmgnums", true);
    t.checkPref("vo-powerfx", true);
    t.checkPref("vo-convfx", true);
    t.checkPref("vo-lightfx", true);
    t.checkPref("vo-lighting", false);
    t.sliderPref("vo-dark", 40, 0, 90, 5, function(i){ return i + "%"; });
  });
}


/* ===================== v1.8: ЗВУКИ СОБЫТИЙ ===================== */
Events.on(EventType.UnlockEvent, function(e){ guard("звук открытия", function(){ sndUI("unlock", 0.7); }); });
Events.on(EventType.GameOverEvent, function(e){
  guard("звук конца игры", function(){
    if(Vars.headless) return;
    if(e.winner == Vars.player.team()) sndUI("win", 0.8);
    else sndUI("lose", 0.8);
  });
});
Events.on(EventType.SectorCaptureEvent, function(e){ guard("звук победы", function(){ sndUI("win", 0.8); }); });

/* ===================== v1.8: АНИМИРОВАННОЕ МЕНЮ ===================== */
var menuSparks = [];
for(var mi = 0; mi < 55; mi++){
  menuSparks.push([Math.random(), Math.random(), 0.3 + Math.random() * 0.7, Math.random() * 6.28, 0.7 + Math.random() * 1.8]);
}
var menuShoot = {on: false, t: 0, x: 0, y: 0, a: 0, nextAt: 200};
var tmpC = new Color();

var menuOverlay = extend(Packages.arc.scene.Element, {
  draw: function(){
    if(!pref("vo-menufx", true)) return;
    if(!Vars.state.isMenu() || Core.scene.hasDialog()) return;
    var self = this;
    var w = self.width, h = self.height, t = Time.time;
    Draw.blend(AdditiveBlend);
    Draw.color(Color.white);
    // северное сияние: три мягкие волнистые ленты
    var bands = [[0.64, 0.25, 0.9, 0.55], [0.55, 0.45, 0.55, 1.0], [0.72, 0.8, 0.4, 0.9]];
    for(var k = 0; k < bands.length; k++){
      var bd = bands[k], segs = 28, sw = w / segs;
      for(var i = 0; i < segs; i++){
        var x1 = self.x + i * sw, x2 = x1 + sw;
        var y1 = self.y + h * (bd[0] + 0.05 * Math.sin(i * 0.35 + t * 0.008 + k * 2)) ;
        var y2 = self.y + h * (bd[0] + 0.05 * Math.sin((i + 1) * 0.35 + t * 0.008 + k * 2));
        var al = 0.07 * (0.6 + 0.4 * Math.sin(i * 0.5 - t * 0.012 + k));
        var up = h * 0.16;
        var cTop = tmpC.set(bd[1], bd[2], bd[3], 0).toFloatBits();
        var cLow = tmpC.set(bd[1], bd[2], bd[3], al).toFloatBits();
        Fill.quad(x1, y1, cLow, x2, y2, cLow, x2, y2 + up, cTop, x1, y1 + up, cTop);
        var cDown = tmpC.set(bd[1], bd[2], bd[3], 0).toFloatBits();
        Fill.quad(x1, y1 - up * 0.5, cDown, x2, y2 - up * 0.5, cDown, x2, y2, cLow, x1, y1, cLow);
      }
    }
    Draw.color(Color.white);
    // всплывающие светящиеся искры
    for(var s2 = 0; s2 < menuSparks.length; s2++){
      var sp = menuSparks[s2];
      var fy = (sp[1] + t * 0.0006 * sp[2]) % 1;
      var px = self.x + ((sp[0] + Math.sin(t * 0.01 * sp[2] + sp[3]) * 0.02) % 1) * w, py = self.y + fy * h;
      var tw = 0.5 + 0.5 * Math.sin(t * 0.04 * sp[2] + sp[3]);
      Draw.color(col("ffd9a0"), col("7fb2ff"), fy);
      Draw.alpha(0.18 + 0.4 * tw);
      Fill.circle(px, py, sp[4] * 0.9);
      Draw.alpha(0.08 * tw);
      Fill.circle(px, py, sp[4] * 3);
    }
    // падающие звёзды
    if(!menuShoot.on && t > menuShoot.nextAt){
      menuShoot.on = true; menuShoot.t = 0;
      menuShoot.x = self.x + Math.random() * w; menuShoot.y = self.y + h * (0.6 + Math.random() * 0.4);
      menuShoot.a = 200 + Math.random() * 40;
    }
    if(menuShoot.on){
      menuShoot.t += Time.delta;
      var f = menuShoot.t / 45;
      if(f >= 1){ menuShoot.on = false; menuShoot.nextAt = t + 300 + Math.random() * 500; }
      else{
        var al2 = Math.sin(f * Math.PI);
        for(var q = 0; q < 12; q++){
          var ff = Math.max(0, f - q * 0.012);
          Draw.color(Color.white, col("7fb2ff"), q / 12);
          Draw.alpha(al2 * (1 - q / 12) * 0.8);
          Fill.circle(menuShoot.x + Mathf.cosDeg(menuShoot.a) * ff * 300, menuShoot.y + Mathf.sinDeg(menuShoot.a) * ff * 300, 2.4 - q * 0.17);
        }
      }
    }
    Draw.blend();
    Draw.reset();
  }
});

function installMenuFx(){
  try{
    menuOverlay.setFillParent(true);
    menuOverlay.touchable = Packages.arc.scene.event.Touchable.disabled;
    if(Vars.ui.menuGroup != null) Vars.ui.menuGroup.addChild(menuOverlay);
    else Core.scene.add(menuOverlay);
  }catch(err){ fail("меню", err); }
}

/* ===================== v1.7: КРАСИВЫЕ ПЛАНЕТЫ И КОСМОС (меню «Играть» → кампания) ===================== */

var planetStars = [];
for(var pi = 0; pi < 90; pi++){
  planetStars.push([Math.random(), Math.random(), Math.random() * 6.28, 0.5 + Math.random() * 1.5]);
}
var shoot = {on: false, t: 0, x: 0, y: 0, a: 0, nextAt: 240};

var planetOverlay = extend(Packages.arc.scene.Element, {
  draw: function(){
    if(!pref("vo-planetfx", true)) return;
    var self = this;
    var w = self.width, h = self.height, t = Time.time;
    updatePlanetTheme();
    Draw.blend(AdditiveBlend);
    Draw.color(Color.white);
    // цветные туманные свечения по углам (цвет зависит от планеты)
    try{
      var th = themeNow, gw = w * 0.5, gh = h * 0.5;
      var pulse2 = 0.8 + 0.2 * Math.sin(t * 0.01);
      var c0 = tmpC.set(th.r, th.g, th.b, 0.16 * pulse2).toFloatBits();
      var c1 = tmpC.set(th.r, th.g, th.b, 0).toFloatBits();
      Fill.quad(self.x, self.y, c0, self.x + gw, self.y, c1, self.x + gw, self.y + gh, c1, self.x, self.y + gh, c1);
      Fill.quad(self.x + w, self.y + h, c0, self.x + w - gw, self.y + h, c1, self.x + w - gw, self.y + h - gh, c1, self.x + w, self.y + h - gh, c1);
      var c2 = tmpC.set(th.g, th.b, th.r, 0.10 * pulse2).toFloatBits();
      Fill.quad(self.x + w, self.y, c2, self.x + w - gw, self.y, c1, self.x + w - gw, self.y + gh, c1, self.x + w, self.y + gh, c1);
    }catch(err){ fail("свечение космоса", err); }
    Draw.color(Color.white);
    // мерцающие звёзды-искры
    for(var s = 0; s < planetStars.length; s++){
      var st = planetStars[s];
      var tw = Math.pow(Math.abs(Math.sin(t * 0.02 * st[3] + st[2])), 3);
      var px = self.x + ((st[0] + t * 0.00002 * st[3]) % 1) * w, py = self.y + st[1] * h;
      Draw.color(Color.white, col("9ec8ff"), st[3] / 2);
      Draw.alpha(0.12 + 0.55 * tw);
      Fill.circle(px, py, st[3] * 0.8);
      if(st[3] > 1.5){
        Lines.stroke(0.8);
        Draw.alpha(0.35 * tw);
        Lines.line(px - st[3] * 5 * tw, py, px + st[3] * 5 * tw, py);
        Lines.line(px, py - st[3] * 5 * tw, px, py + st[3] * 5 * tw);
      }
    }
    // падающие звёзды
    if(!shoot.on && t > shoot.nextAt){
      shoot.on = true; shoot.t = 0;
      shoot.x = self.x + Math.random() * w; shoot.y = self.y + h * (0.55 + Math.random() * 0.45);
      shoot.a = 200 + Math.random() * 40;
    }
    if(shoot.on){
      shoot.t += Time.delta;
      var f = shoot.t / 40;
      if(f >= 1){
        shoot.on = false;
        shoot.nextAt = t + 240 + Math.random() * 420;
      }else{
        var hx = shoot.x + Mathf.cosDeg(shoot.a) * f * 260, hy = shoot.y + Mathf.sinDeg(shoot.a) * f * 260;
        var al = Math.sin(f * Math.PI);
        for(var q = 0; q < 10; q++){
          var ff = Math.max(0, f - q * 0.012);
          Draw.color(Color.white, col("7fb2ff"), q / 10);
          Draw.alpha(al * (1 - q / 10) * 0.8);
          Fill.circle(shoot.x + Mathf.cosDeg(shoot.a) * ff * 260, shoot.y + Mathf.sinDeg(shoot.a) * ff * 260, 2.2 - q * 0.17);
        }
        Draw.color(Color.white, al);
        Fill.circle(hx, hy, 2.4);
      }
    }
    Draw.blend();
    // мягкая виньетка по краям
    try{
      var cb = Color.black.toFloatBits(), cc = Color.clear.toFloatBits();
      var vw = w * 0.14, vh = h * 0.16;
      Draw.color(Color.white);
      Fill.quad(self.x, self.y, cb, self.x + w, self.y, cb, self.x + w, self.y + vh, cc, self.x, self.y + vh, cc);
      Fill.quad(self.x, self.y + h, cb, self.x + w, self.y + h, cb, self.x + w, self.y + h - vh, cc, self.x, self.y + h - vh, cc);
      Fill.quad(self.x, self.y, cb, self.x, self.y + h, cb, self.x + vw, self.y + h, cc, self.x + vw, self.y, cc);
      Fill.quad(self.x + w, self.y, cb, self.x + w, self.y + h, cb, self.x + w - vw, self.y + h, cc, self.x + w - vw, self.y, cc);
    }catch(err){ fail("виньетка", err); }
    Draw.reset();
  }
});

function beautifyPlanets(){
  // атмосфера: чуть шире и светлее
  Vars.content.planets().each(function(p){
    try{
      if(p.hasAtmosphere && p.parent != null){
        p.atmosphereRadOut = Math.min(0.55, p.atmosphereRadOut * 1.35 + 0.02);
        p.atmosphereColor.lerp(Color.white, 0.12);
      }
    }catch(err){ fail("атмосфера", err); }
  });
  // дополнительный слой облаков у Серпуло
  try{
    var sp = Planets.serpulo;
    if(sp != null && sp.cloudMesh != null){
      var g3 = Packages.mindustry.graphics.g3d;
      var extra = new g3.HexSkyMesh(sp, 23, 0.4, 0.14, 5, col("e8f6ff55"), 3, 0.5, 1.1, 0.42);
      sp.cloudMesh = new g3.MultiMesh(sp.cloudMesh, extra);
    }
  }catch(err){ fail("облака", err); }
  try{
    var er = Planets.erekir;
    if(er != null && er.cloudMesh == null){
      var g4 = Packages.mindustry.graphics.g3d;
      er.cloudMesh = new g4.HexSkyMesh(er, 3, 0.2, 0.14, 5, col("ff7a5a33"), 2, 0.5, 1.0, 0.45);
    }
  }catch(err){ fail("облака эрекира", err); }
}

// небо: 6 готовых граней (mod: vo-sky/*.png) заменяют стандартный звёздный куб
var skyCache = {}, curSkyFolder = "";
function applySkybox(folder){
  if(folder == curSkyFolder) return;
  var mesh = skyCache[folder];
  if(mesh == null){
    var names = ["px", "nx", "py", "ny", "pz", "nz"];
    var pms = [];
    for(var i = 0; i < 6; i++){
      var f = Vars.tree.get(folder + "/" + names[i] + ".png");
      if(f == null || !f.exists()) throw "нет файла " + folder + "/" + names[i] + ".png";
      pms.push(new Packages.arc.graphics.Pixmap(f));
    }
    var cube = new Packages.arc.graphics.Cubemap(pms[0], pms[1], pms[2], pms[3], pms[4], pms[5]);
    mesh = new Packages.mindustry.graphics.CubemapMesh(cube);
    skyCache[folder] = mesh;
  }
  Packages.arc.util.Reflect.set(Vars.renderer.planets, "skybox", mesh);
  curSkyFolder = folder;
}

// тема космоса для планеты: небо + цвет свечения по углам
function planetTheme(name){
  if(name == "erekir") return {sky: "vo-sky-red", r: 1.0, g: 0.38, b: 0.22};
  if(name == "sun") return {sky: "vo-sky-gold", r: 1.0, g: 0.78, b: 0.3};
  return {sky: "vo-sky", r: 0.25, g: 0.5, b: 1.0};
}
var themeName = "", themeNow = planetTheme("serpulo"), themeFail = false;
function updatePlanetTheme(){
  if(themeFail) return;
  try{
    var pl = Vars.ui.planet.state.planet;
    var nm = pl == null ? "" : String(pl.name);
    if(nm != themeName){
      themeName = nm;
      themeNow = planetTheme(nm);
      try{ applySkybox(themeNow.sky); }catch(err){ fail("смена космоса", err); }
    }
  }catch(err){ themeFail = true; fail("тема планеты", err); }
}

/* ===================== НОВЫЙ ВИД САМИХ ПУЛЬ И СНАРЯДОВ ===================== */
// Меняется только внешний вид типов пуль (цвет, форма, шлейф, свечение, эффекты попадания).
// Урон, скорость, дальность и хитбокс не затрагиваются.

var BasicBulletClass = Packages.mindustry.entities.bullet.BasicBulletType;
var ShrapnelClass = Packages.mindustry.entities.bullet.ShrapnelBulletType;
var ItemTurretClass = Packages.mindustry.world.blocks.defense.turrets.ItemTurret;
var restyled = {};

function sset(o, k, v){ try{ o[k] = v; }catch(err){} }
function boost(c, sat, bright){
  var avg = (c.r + c.g + c.b) / 3;
  return new Color(Mathf.clamp((avg + (c.r - avg) * sat) * bright), Mathf.clamp((avg + (c.g - avg) * sat) * bright), Mathf.clamp((avg + (c.b - avg) * sat) * bright), 1);
}

// Взрыватель (Fuse): вспышка выстрела с мерцанием вдоль всего луча (длина зашита в эффект)
function makeFuseShoot(L){
  return new Effect(30, L * 2 + 80, function(e){
    var a = e.fout();
    Draw.color(Color.white, e.color, e.fin());
    Lines.stroke(a * 2.2);
    Angles.randLenVectors(e.id, 12, 6 + e.finpow() * 38, e.rotation, 22, function(x, y){
      Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), a * 6 + 0.8);
    });
    Draw.color(e.color, 0.6 * a);
    Fill.circle(e.x, e.y, a * 5);
    Lines.stroke(a * 1.5);
    Lines.circle(e.x, e.y, e.finpow() * 14);
    Draw.color(Color.white, e.color, e.fin());
    for(var i = 0; i < 12; i++){
      var f = Mathf.randomSeed(e.id * 11 + i, 0.08, 1);
      var off = Mathf.randomSeed(e.id * 7 + i, -6, 6) * e.fin();
      var px = e.x + Angles.trnsx(e.rotation, L * f) + Angles.trnsx(e.rotation + 90, off);
      var py = e.y + Angles.trnsy(e.rotation, L * f) + Angles.trnsy(e.rotation + 90, off);
      Fill.square(px, py, a * 2 + 0.2, 45 + e.fin() * 120);
    }
    Draw.color(e.color, 0.25 * a);
    Lines.stroke(7 * a);
    Lines.lineAngle(e.x, e.y, e.rotation, L);
    Drawf.light(e.x, e.y, 30 * a, e.color, 0.5 * a);
  });
}
var fuseShootCache = {};
function fuseShootFor(L){
  var key = Math.max(1, Math.round(L / 10)) * 10;
  if(fuseShootCache[key] == null) fuseShootCache[key] = makeFuseShoot(key);
  return fuseShootCache[key];
}
var fuseHitFx = new Effect(26, 100, function(e){
  var a = e.fout();
  Draw.color(Color.white, e.color, e.fin());
  Lines.stroke(a * 1.8 + 0.2);
  Angles.randLenVectors(e.id, 10, 3 + e.finpow() * 22, function(x, y){
    Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), a * 5 + 0.6);
  });
  Lines.stroke(a * 1.4);
  Lines.circle(e.x, e.y, 2 + e.finpow() * 12);
  Draw.color(e.color, 0.6 * a);
  Fill.circle(e.x, e.y, a * 4);
  Angles.randLenVectors(e.id + 5, 5, 2 + e.finpow() * 14, function(x, y){
    Fill.square(e.x + x, e.y + y, a * 2 + 0.2, 45);
  });
  Drawf.light(e.x, e.y, 22 * a, e.color, 0.45 * a);
});

function restyleBullet(ty, depth){
  if(ty == null || depth > 2) return;
  var key = String(ty.hashCode());
  if(restyled[key]) return;
  restyled[key] = true;
  var kind = bulletKind(ty);
  if(kind == "liquid" || kind == "cont") return;

  if(ty instanceof BasicBulletClass){
    var back = boost(ty.backColor, 1.4, 1.1);
    var front = back.cpy().lerp(Color.white, 0.78);
    sset(ty, "backColor", back);
    sset(ty, "frontColor", front);
    sset(ty, "hitColor", back);
    if(kind == "artillery"){
      sset(ty, "width", ty.width * 1.1); sset(ty, "height", ty.height * 1.1);
    }else{
      sset(ty, "width", ty.width * 1.12); sset(ty, "height", ty.height * 1.35);
    }
    var tw = Math.max(1.1, ty.width * (kind == "artillery" ? 0.22 : 0.3));
    var tl = ty.trailLength > 0 ? ty.trailLength : (kind == "artillery" ? 14 : (kind == "flak" ? 7 : 10));
    sset(ty, "trailLength", tl);
    sset(ty, "trailWidth", tw);
    sset(ty, "trailColor", back);
    if(kind == "artillery"){ sset(ty, "trailEffect", smokeTrailFx); sset(ty, "trailInterval", 3); }
    else if(kind == "flak"){ sset(ty, "trailEffect", sparkleTrailFx); sset(ty, "trailInterval", 2); }
    else if(kind == "missile"){ sset(ty, "trailEffect", missileTrailFx); sset(ty, "trailInterval", 2); }
    sset(ty, "lightColor", back);
    sset(ty, "lightRadius", Math.max(10, ty.width * 2.6));
    sset(ty, "lightOpacity", 0.35);
    var splashR = ty.splashDamageRadius;
    if(ty.hitEffect != Fx.none){
      sset(ty, "hitEffect", splashR > 16 ? bigBoomFor(splashR) : sparkHitFx);
    }
    if(ty.despawnEffect != Fx.none){
      sset(ty, "despawnEffect", splashR > 16 ? bigBoomFor(splashR) : fizzleFx);
    }
  }else if(ty instanceof LaserBullet){
    try{
      var cs = ty.colors;
      for(var i = 0; i < cs.length; i++) cs[i].set(boost(cs[i], 1.3, 1.05));
    }catch(err){}
  }else if(ty instanceof LightningBulletClass){
    try{ ty.lightningColor = boost(ty.lightningColor, 1.3, 1.1); }catch(err){}
  }else if(ty instanceof ShrapnelClass){
    try{
      var fc = boost(ty.fromColor, 1.35, 1.1), tc = boost(ty.toColor, 1.35, 1.1);
      sset(ty, "fromColor", fc); sset(ty, "toColor", tc); sset(ty, "hitColor", tc);
      sset(ty, "serrations", 10);
      sset(ty, "serrationLenScl", ty.serrationLenScl * 1.15);
      sset(ty, "serrationWidth", ty.serrationWidth * 1.2);
      sset(ty, "lightColor", tc); sset(ty, "lightRadius", 40); sset(ty, "lightOpacity", 0.4);
      sset(ty, "shootEffect", fuseShootFor(ty.length));
      sset(ty, "hitEffect", fuseHitFx);
    }catch(err){ fail("шрапнель", err); }
  }
  try{ if(ty.fragBullet != null) restyleBullet(ty.fragBullet, depth + 1); }catch(err){}
  try{ if(ty.intervalBullet != null) restyleBullet(ty.intervalBullet, depth + 1); }catch(err){}
}

function restyleAllBullets(){
  var cnt = 0;
  Vars.content.blocks().each(function(b){
    try{
      if(!(b instanceof TurretClass)) return;
      var list = [];
      if(b instanceof ItemTurretClass){
        try{
          b.ammoTypes.each(function(item, bt){ list.push(bt); });
        }catch(e1){
          var arr = b.ammoTypes.values().toSeq();
          for(var q = 0; q < arr.size; q++) list.push(arr.get(q));
        }
      }else if(b.shootType != undefined && b.shootType != null){
        list.push(b.shootType);
      }
      for(var j = 0; j < list.length; j++){
        try{ restyleBullet(list[j], 0); cnt++; }catch(e2){ fail("пуля " + b.name, e2); }
      }
    }catch(err){ fail("пули " + b.name, err); }
  });
  Vars.content.units().each(function(u){
    try{
      u.weapons.each(function(w){ if(w.bullet != null){ restyleBullet(w.bullet, 0); cnt++; } });
    }catch(err){ fail("оружие " + u.name, err); }
  });
  return cnt;
}

function installPlanetFx(){
  if(pref("vo-bulletfx", true)){ try{ restyleAllBullets(); }catch(err){ fail("пули", err); } }
  try{ beautifyPlanets(); }catch(err){ fail("планеты", err); }
  try{ applySkybox("vo-sky"); }catch(err){ fail("космос", err); }
  try{
    planetOverlay.setFillParent(true);
    planetOverlay.touchable = Packages.arc.scene.event.Touchable.disabled;
    Vars.ui.planet.addChild(planetOverlay);
  }catch(err){ fail("оверлей планет", err); }
  try{
    if(Blocks.meltdown != null && Blocks.meltdown.shootType != null) tuneMelt(Blocks.meltdown.shootType);
  }catch(err){ fail("настройка испепелителя", err); }
}

/* ===================== v1.9: КАЧЕСТВО, СИЛОВЫЕ КУПОЛА, ПОГОДА, СЛЕДЫ ЮНИТОВ ===================== */

// Качество эффектов: 0 - низкое (для слабых телефонов), 1 - среднее, 2 - высокое
function qLevel(){ return Core.settings.getInt("vo-quality", 2); }
function qm(){ var q = qLevel(); return q <= 0 ? 0.35 : (q == 1 ? 0.7 : 1); }

var CamRect = new Packages.arc.math.geom.Rect();
function camBounds(){ Core.camera.bounds(CamRect); return CamRect; }
function wrap01(v){ return v - Math.floor(v); }

/* ---------- следы юнитов ---------- */

function sizeIdx(hs){ return hs < 10 ? 0 : (hs < 20 ? 1 : (hs < 40 ? 2 : 3)); }

// пыль из-под ног и гусениц: цвет берётся от поверхности
function makeDustFx(sc){
  var fx = new Effect(26 + sc * 6, 60, function(e){
    var a = e.fout();
    Draw.color(e.color, 0.4 * a);
    Angles.randLenVectors(e.id, 2, 1 + e.finpow() * 5 * sc, function(x, y){
      Fill.circle(e.x + x, e.y + y + e.fin() * 2, (0.7 + e.fin() * 1.9) * sc);
    });
  });
  try{ fx.layer = LayerClass.debris; }catch(err){}
  return fx;
}

// кильватер: расходящийся след и пенное кольцо (e.rotation = курс движения)
function makeWakeFx(sc){
  var fx = new Effect(36 + sc * 8, 120, function(e){
    var a = e.fout();
    Draw.color(e.color, 0.6 * a);
    Lines.stroke(0.8 + a * 1.2);
    Lines.circle(e.x, e.y, (1 + e.finpow() * 5) * sc);
    var spread = 24 + e.fin() * 18;
    for(var s = -1; s <= 1; s += 2){
      Lines.lineAngle(e.x, e.y, e.rotation + 180 + s * spread, (2 + e.finpow() * 7) * sc);
    }
  });
  try{ fx.layer = LayerClass.debris; }catch(err){}
  return fx;
}

// воздушный след: мягкая тающая дымка цвета команды
function makeTrailFx(sc){
  return new Effect(30 + sc * 8, 60, function(e){
    var a = e.fout();
    Draw.color(Color.white, e.color, e.fin());
    Draw.alpha(0.34 * a);
    Fill.circle(e.x, e.y, (0.6 + a * 1.3) * sc);
    Draw.alpha(0.12 * a);
    Fill.circle(e.x, e.y, (1.2 + e.fin() * 2.2) * sc);
  });
}

var dustFxs = [makeDustFx(0.8), makeDustFx(1.3), makeDustFx(2.0), makeDustFx(3.0)];
var wakeFxs = [makeWakeFx(0.8), makeWakeFx(1.3), makeWakeFx(2.0), makeWakeFx(3.0)];
var trailFxs = [makeTrailFx(0.8), makeTrailFx(1.3), makeTrailFx(2.0), makeTrailFx(3.0)];

function dustColor(fl){ return new Color(fl.mapColor).lerp(Color.white, 0.22); }
function wakeColor(fl){ return new Color(fl.mapColor).lerp(Color.white, 0.75); }

function trackTrails(){
  var q = qLevel(), qmv = qm();
  var cap = q == 0 ? 10 : (q == 1 ? 22 : 40);
  var cb = camBounds();
  var made = 0;
  var dt = Time.delta;
  var n = Groups.unit.size();
  for(var i = 0; i < n && made < cap; i++){
    var u = Groups.unit.index(i);
    if(u == null) continue;
    if(!cb.contains(u.x, u.y)) continue;
    var sp = u.vel.len();
    if(sp < 0.12) continue;
    var hs = u.hitSize;
    var si = sizeIdx(hs);
    var flying = u.isFlying();
    var fl = null, rate;
    if(flying){
      rate = 0.28;
    }else{
      fl = u.floorOn();
      if(fl == null || String(fl.name) == "air" || String(fl.name) == "empty") continue;
      rate = fl.isLiquid ? 0.2 : 0.22;
    }
    rate *= Math.min(1.4, 0.5 + sp * 0.5) * qmv;
    if(!Mathf.chance(rate * dt)) continue;
    var rot = u.vel.angle();
    var bx = u.x - Angles.trnsx(rot, hs * 0.35), by = u.y - Angles.trnsy(rot, hs * 0.35);
    if(flying){
      trailFxs[si].at(bx, by, rot, u.team.color);
    }else if(fl.isLiquid){
      wakeFxs[si].at(bx, by, rot, wakeColor(fl));
    }else{
      dustFxs[si].at(bx + Mathf.range(hs * 0.25), by + Mathf.range(hs * 0.25), rot, dustColor(fl));
    }
    made++;
  }
}

/* ---------- силовые купола ---------- */

var ForceProjectorClass = Packages.mindustry.world.blocks.defense.ForceProjector;
var domeList = [];
var domeTick = 0;
var domeCol = new Color();

function refreshDomes(){
  var list = [];
  Groups.build.each(function(b){
    if(b.block instanceof ForceProjectorClass) list.push(b);
  });
  domeList = list;
}

function drawDomes(){
  if(domeList.length == 0) return;
  var q = qLevel();
  var t = Time.time;
  var cb = camBounds();
  var z0 = Draw.z();
  Draw.z(LayerClass.shields + 0.5);
  for(var i = 0; i < domeList.length; i++){
    var b = domeList[i];
    if(b == null || !b.isValid()) continue;
    if(b.broken || b.radscl < 0.05) continue;
    var r = b.realRadius();
    if(!cb.overlaps(b.x - r, b.y - r, r * 2, r * 2)) continue;
    var hit = Mathf.clamp(b.hit);
    var heat = Mathf.clamp(b.buildup / Math.max(1, b.block.shieldHealth));
    // цвет команды, при перегрузке уходит в красный, при попадании вспыхивает белым
    domeCol.set(b.team.color).lerp(cRed, heat * 0.7).lerp(Color.white, hit * 0.5);
    var pulse = 0.5 + 0.5 * Math.sin(t * 0.05 + b.id);

    // пульсирующая граница
    Draw.color(domeCol, 0.34 + pulse * 0.14 + hit * 0.4);
    Lines.stroke(1.6 + hit * 2);
    Lines.circle(b.x, b.y, r);

    if(q >= 1){
      // мягкое свечение у края
      Draw.color(domeCol, 0.05 + hit * 0.1);
      Lines.stroke(r * 0.16);
      Lines.circle(b.x, b.y, r * 0.93);
      // вращающиеся шестиугольные соты
      Draw.color(domeCol, 0.16 + hit * 0.3);
      Lines.stroke(1);
      Lines.poly(b.x, b.y, 6, r * 0.96, t * 0.12);
      if(q >= 2) Lines.poly(b.x, b.y, 6, r * 0.88, -t * 0.08);
      // бегущие по куполу дуги-блики
      var na = q >= 2 ? 3 : 2;
      for(var k = 0; k < na; k++){
        var base = t * (0.9 + k * 0.35) * (k % 2 == 0 ? 1 : -1) + k * 360 / na + b.id * 37;
        Draw.color(domeCol, 0.55 + hit * 0.4);
        Lines.stroke(2 + hit * 2);
        Lines.arc(b.x, b.y, r, 0.1 + heat * 0.06, base);
      }
      // трещины при сильной перегрузке
      if(heat > 0.55){
        var nc = Math.round((heat - 0.55) * 14) + 2;
        Lines.stroke(1);
        for(var j = 0; j < nc; j++){
          var an = j * 360 / nc + b.id * 13;
          var len = r * (0.1 + 0.1 * (((j * 7 + b.id) % 5) / 5));
          Draw.color(cRed, Color.white, 0.2 + 0.3 * Math.sin(t * 0.4 + j));
          Draw.alpha(0.5 + 0.3 * Math.sin(t * 0.3 + j));
          Lines.lineAngle(b.x + Angles.trnsx(an, r - len), b.y + Angles.trnsy(an, r - len), an, len);
        }
      }
    }

    // вспышка-кольцо при попадании
    if(hit > 0.02){
      Draw.color(Color.white, hit * 0.6);
      Lines.stroke(1 + hit * 3);
      Lines.circle(b.x, b.y, r * (1 + (1 - hit) * 0.06));
    }
    Drawf.light(b.x, b.y, r * 1.5, domeCol, 0.28 + hit * 0.3);
  }
  Draw.reset();
  Draw.z(z0);
}

/* ---------- красивая погода v2: мягкие спрайты, слои глубины, порывы ветра, туман, молнии ---------- */
// Все частицы рисуются заранее сгенерированными мягкими спрайтами (градиентные точки, кристаллы снега,
// хвостатые капли, облака, виньетка), а не плоскими кругами. Ванильные частицы погоды выключаются,
// чтобы они не перебивали картинку (если что-то идёт не так - ванильная погода возвращается сама).

var WN = 360;
var wpx = [], wpy = [], wps = [], wpv = [], wpa = [], wph = [];
(function(){
  var s = 12345;
  function rnd(){ s = (s * 16807) % 2147483647; return s / 2147483647; }
  for(var i = 0; i < WN; i++){ wpx.push(rnd()); wpy.push(rnd()); wps.push(rnd()); wpv.push(rnd()); wpa.push(rnd()); wph.push(rnd()); }
})();

// координаты частиц привязаны к миру и зациклены по размеру экрана (как у ванильной погоды)
function wxp(u, left, cw){ return left + wrap01(u - left / cw) * cw; }
function wyp(v, bottom, ch){ return bottom + wrap01(v - bottom / ch) * ch; }

var cRainTint = col("0a1a30"), cRainLine = col("cfe4ff"), cRainFar = col("8aa6c8"), cRainSplash = col("d6e8ff"), cRainVig = col("04101e"), cRainMist = col("9db4cc");
var cSnowTint = col("a9cbff"), cSnowVig = col("cfe6ff"), cSnowHaze = col("dcebff");
var cSandTint = col("c9803a"), cSandLine = col("f0d49a"), cSandCloud = col("e0b070"), cSandVig = col("5a2a08");
var cSporeTint = col("5a2a78"), cSporeVig = col("b040e0"), cSporeMist = col("8a3ab0");
var cFog = col("b9c6d6");
var sporePal = [[1.0, 0.45, 0.95], [0.72, 0.45, 1.0], [0.45, 0.88, 1.0], [1.0, 0.72, 0.9], [0.6, 1.0, 0.8]];

var thunderFlash = 0, thunderFlick = false, boltX = 0, boltY = 0, boltSeed = 1, boltH = 300;

function wFill(left, bottom, cw, ch){ Fill.rect(left + cw / 2, bottom + ch / 2, cw, ch); }

/* ----- спрайты ----- */
var WX = null, wxBroken = false, wxFails = 0;

function wxMake(w, h, fn){
  var pm = new PixmapClass(w, h);
  var raw = (typeof pm.setRaw === "function");
  for(var y = 0; y < h; y++){
    for(var x = 0; x < w; x++){
      var a = fn((x + 0.5) / w * 2 - 1, (y + 0.5) / h * 2 - 1);
      var c = packC(1, 1, 1, c01(a));
      if(raw) pm.setRaw(x, y, c); else pm.set(x, y, c);
    }
  }
  return new TextureRegionClass(uiMakeTex(pm));
}

function wxInit(){
  if(WX != null) return;
  var S = {};
  // мягкая точка
  S.soft = wxMake(48, 48, function(u, v){
    var r = Math.sqrt(u * u + v * v);
    if(r >= 1) return 0;
    var s = 1 - r;
    return s * s * (3 - 2 * s);
  });
  // кольцо всплеска
  S.ring = wxMake(64, 64, function(u, v){
    var r = Math.sqrt(u * u + v * v);
    if(r >= 1) return 0;
    var d = (r - 0.74) / 0.13;
    return Math.exp(-d * d) * c01((1 - r) * 6);
  });
  // капля/штрих с хвостом: «голова» внизу картинки
  S.streak = wxMake(8, 64, function(u, v){
    var wf = c01(1 - Math.abs(u));
    wf *= wf;
    var lf = Math.pow(c01((v + 1) / 2), 1.7);
    return wf * lf * (1 - 0.35 * c01((v - 0.88) * 8));
  });
  // шестилучевая снежинка с веточками
  S.flake = wxMake(64, 64, function(u, v){
    var r = Math.sqrt(u * u + v * v);
    if(r >= 1) return 0;
    var best = 0;
    for(var k = 0; k < 3; k++){
      var th = k * Math.PI / 3 + Math.PI / 6;
      var c = Math.cos(th), s = Math.sin(th);
      var along = Math.abs(u * c + v * s), perp = Math.abs(u * s - v * c);
      var arm = c01(1 - perp / 0.085) * c01((0.92 - along) / 0.12);
      var br = 0;
      if(along > 0.28 && along < 0.78){
        var p2 = Math.abs(perp - (along - 0.28) * 0.55);
        br = c01(1 - p2 / 0.07) * c01((0.78 - along) / 0.1) * 0.85;
      }
      best = Math.max(best, arm, br);
    }
    var core = c01(1 - r / 0.2);
    return Math.max(best * c01((1 - r) * 5), core * 0.8);
  });
  // четырёхлучевая искра
  S.star = wxMake(48, 48, function(u, v){
    var au = Math.abs(u), av = Math.abs(v);
    var h = c01(1 - av / 0.09) * Math.pow(c01(1 - au), 1.8);
    var vv = c01(1 - au / 0.09) * Math.pow(c01(1 - av), 1.8);
    var cr = c01(1 - Math.sqrt(u * u + v * v) / 0.3);
    return Math.max(h, vv, cr * cr);
  });
  // клубящееся облако из нескольких пятен
  S.cloud = wxMake(64, 64, function(u, v){
    var r = Math.sqrt(u * u + v * v);
    if(r >= 1) return 0;
    var bl = [[-0.3, -0.1, 0.55], [0.32, 0.12, 0.5], [0.0, 0.35, 0.45], [-0.1, -0.4, 0.4], [0.45, -0.3, 0.35]];
    var a = 0;
    for(var i = 0; i < bl.length; i++){
      var dx = u - bl[i][0], dy = v - bl[i][1];
      a += Math.exp(-(dx * dx + dy * dy) / (bl[i][2] * bl[i][2]) * 1.6);
    }
    return c01(a * 0.6) * c01((1 - r) * 3);
  });
  // виньетка на весь экран
  S.vig = wxMake(64, 64, function(u, v){
    var m = Math.max(Math.abs(u), Math.abs(v)), r = Math.sqrt(u * u + v * v) / 1.414;
    var k = c01((m * 0.55 + r * 0.45 - 0.42) / 0.58);
    return k * k * (3 - 2 * k);
  });
  WX = S;
}

function wr(reg, x, y, w, h, rot){ Draw.rect(reg, x, y, w, h, rot); }

/* ----- дождь ----- */
function rainFx(a, left, bottom, cw, ch, t, qmv, q){
  var cx = left + cw / 2, cy = bottom + ch / 2, i, k;
  var gust = 0.72 + 0.28 * Math.sin(t * 0.0031) + 0.12 * Math.sin(t * 0.0113 + 1.7);
  var wind = -(0.0014 + 0.0016 * gust);

  // сумрак и тёмные края кадра
  Draw.color(cRainTint, 0.12 * a);
  wFill(left, bottom, cw, ch);
  Draw.color(cRainVig, 0.6 * a);
  wr(WX.vig, cx, cy, cw * 1.04, ch * 1.04, 0);

  // низкий туман над землёй
  var nb = Math.round(8 * qmv * a) + 2;
  for(i = 0; i < nb; i++){
    var bx = wxp(wpx[i] + t * 0.0007 * (0.5 + wpv[i]), left, cw);
    var by = wyp(wpy[i] + Math.sin(t * 0.003 + wps[i] * 20) * 0.01, bottom, ch);
    var rad = 70 + wps[i] * 110;
    Draw.color(cRainMist, 0.045 * a);
    wr(WX.cloud, bx, by, rad * 2.6, rad * 1.5, 0);
  }

  // круги от капель и мелкие брызги
  var ns = Math.min(WN, Math.round(95 * qmv * a));
  for(i = 0; i < ns; i++){
    var rate = 0.022 * (0.7 + wpv[i] * 0.8);
    var cyc = Math.floor(t * rate + wps[i]);
    var ph = wrap01(t * rate + wps[i]);
    var x = wxp(wpx[i] + cyc * 0.6180339, left, cw);
    var y = wyp(wpy[i] + cyc * 0.4142135, bottom, ch);
    var sz = 2 + ph * 11;
    Draw.color(cRainSplash, (1 - ph) * (1 - ph) * 0.55 * a);
    wr(WX.ring, x, y, sz * 2, sz * 2, 0);
    if(q >= 2 && ph < 0.32){
      Draw.color(cRainSplash, (0.32 - ph) * 2.4 * a);
      for(k = 0; k < 4; k++){
        var an = k * 90 + 45 + wps[i] * 40;
        wr(WX.soft, x + Angles.trnsx(an, ph * 26), y + Angles.trnsy(an, ph * 26) + ph * 5, 2, 2, 0);
      }
    }
  }

  // три слоя косых струй с хвостами: дальний, средний, ближний
  var ang = Math.atan2(wind * cw, 0.012 * ch) * 180 / Math.PI;
  var nc = Math.min(WN, Math.round(190 * qmv * a));
  var lenB = [9, 15, 26], lenV = [4, 7, 12], wid = [1.8, 2.8, 4.4], alp = [0.18, 0.32, 0.5], spd = [0.75, 1.0, 1.35];
  for(var j = 0; j < nc; j++){
    var l = wps[j] < 0.4 ? 0 : (wps[j] < 0.75 ? 1 : 2);
    var kk = spd[l] * (0.88 + wpv[j] * 0.24);
    var px = wxp(wpx[j] + t * wind * kk, left, cw);
    var py = wyp(wpy[j] - t * 0.012 * kk, bottom, ch);
    var cc = l == 0 ? cRainFar : cRainLine;
    Draw.color(cc, alp[l] * (0.75 + 0.25 * gust) * a);
    wr(WX.streak, px, py, wid[l], lenB[l] + wpv[j] * lenV[l], ang);
  }
}

/* ----- снег ----- */
function snowFx(a, left, bottom, cw, ch, t, qmv, q){
  var cx = left + cw / 2, cy = bottom + ch / 2, i;
  var gust = 0.6 + 0.4 * Math.sin(t * 0.0027) * Math.sin(t * 0.0061 + 0.8);
  var windX = -0.0007 - 0.0016 * Math.max(0, gust);

  // холодный тон и морозная рамка по краям кадра
  Draw.color(cSnowTint, 0.06 * a);
  wFill(left, bottom, cw, ch);
  Draw.color(cSnowVig, 0.30 * a);
  wr(WX.vig, cx, cy, cw * 1.04, ch * 1.04, 0);

  // мягкая белая дымка
  var nb = Math.round(7 * qmv * a) + 2;
  for(i = 0; i < nb; i++){
    var bx = wxp(wpx[i] + t * 0.0004 * (0.5 + wpv[i]), left, cw);
    var by = wyp(wpy[i] + Math.sin(t * 0.0025 + wps[i] * 20) * 0.01, bottom, ch);
    var rad = 80 + wps[i] * 120;
    Draw.color(cSnowHaze, 0.05 * a);
    wr(WX.cloud, bx, by, rad * 2.4, rad * 1.6, 0);
  }

  // слои снежинок: дальние точки, средние мягкие, ближние кристаллы и большие размытые «боке»
  var cnt = Math.min(WN, Math.round(210 * qmv * a));
  for(i = 0; i < cnt; i++){
    var l = wps[i] < 0.45 ? 0 : (wps[i] < 0.8 ? 1 : 2);
    var kk = [0.5, 0.85, 1.25][l] * (0.75 + wpv[i] * 0.5);
    var y = wyp(wpy[i] - t * 0.0022 * kk, bottom, ch);
    var sway = Math.sin(t * 0.02 * (0.6 + wpv[i]) + wps[i] * 40) * 0.012 + Math.sin(t * 0.004 + (y - bottom) / ch * 12 + wpa[i] * 6) * 0.007;
    var x = wxp(wpx[i] + sway + t * windX * kk, left, cw);
    if(l == 0){
      Draw.color(Color.white, 0.4 * a);
      wr(WX.soft, x, y, 3 + wpv[i] * 2.5, 3 + wpv[i] * 2.5, 0);
    }else if(l == 1){
      Draw.color(Color.white, 0.62 * a);
      var s1 = 4.5 + wpv[i] * 3.5;
      wr(WX.soft, x, y, s1, s1, 0);
      if(q >= 1 && wpa[i] > 0.6){
        Draw.color(Color.white, 0.5 * a);
        wr(WX.flake, x, y, s1 * 1.9, s1 * 1.9, wpa[i] * 360 + t * (wph[i] - 0.5) * 0.8);
      }
    }else{
      var s2 = 9 + wpv[i] * 8;
      if(wpv[i] > 0.82){
        Draw.color(cSnowVig, 0.09 * a);
        wr(WX.soft, x, y, s2 * 3.2, s2 * 3.2, 0);
      }else{
        Draw.color(Color.white, 0.14 * a);
        wr(WX.soft, x, y, s2 * 1.7, s2 * 1.7, 0);
        Draw.color(Color.white, 0.88 * a);
        wr(WX.flake, x, y, s2, s2, wpa[i] * 360 + t * (wph[i] - 0.5) * 1.1);
      }
    }
  }

  // длинные вихри при порыве ветра
  if(q >= 1 && gust > 0.55){
    var ng = Math.round(16 * qmv * a * (gust - 0.4));
    Draw.color(Color.white, 0.12 * a * gust);
    for(i = 0; i < ng; i++){
      var gx = wxp(wpx[i] + t * 0.004 * (0.7 + wpv[i]), left, cw);
      var gy = wyp(wpy[i] * 0.9 + Math.sin(t * 0.01 + wps[i] * 9) * 0.02, bottom, ch);
      wr(WX.streak, gx, gy, 2.2, 44 + wpv[i] * 50, 92);
    }
  }

  // мерцающие искры на снегу
  if(q >= 2){
    var nsp = Math.round(46 * a);
    for(i = 0; i < nsp; i++){
      var tw = Math.sin(t * 0.05 * (0.5 + wpv[i]) + wps[i] * 50);
      if(tw < 0.8) continue;
      var sx = wxp(wpx[i] * 0.97 + 0.01, left, cw), sy = wyp(wpy[i] * 0.97 + 0.01, bottom, ch);
      var ssz = 5 + (tw - 0.8) * 55;
      Draw.color(Color.white, (tw - 0.8) * 5 * a);
      wr(WX.star, sx, sy, ssz, ssz, 0);
    }
  }
}

/* ----- песчаная буря ----- */
function sandFx(a, left, bottom, cw, ch, t, qmv, q){
  var cx = left + cw / 2, cy = bottom + ch / 2, i;
  var gust = 0.65 + 0.35 * Math.sin(t * 0.0023) + 0.15 * Math.sin(t * 0.0089 + 2.1);
  gust = Math.max(0.25, gust);

  // тёплый тон, тёмная рыжая рамка кадра
  Draw.color(cSandTint, 0.14 * a);
  wFill(left, bottom, cw, ch);
  Draw.color(cSandVig, 0.55 * a);
  wr(WX.vig, cx, cy, cw * 1.04, ch * 1.04, 0);

  // слои плотной пыльной мглы, летящей вправо
  if(q >= 1){
    var nb = Math.round(11 * qmv * a) + 3;
    for(i = 0; i < nb; i++){
      var bx = wxp(wpx[i] + t * 0.0016 * (0.6 + wpv[i]) * (0.5 + gust), left, cw);
      var by = wyp(wpy[i] + Math.sin(t * 0.004 + wps[i] * 20) * 0.012, bottom, ch);
      var rad = 60 + wps[i] * 100;
      Draw.color(cSandCloud, (0.05 + 0.03 * gust) * a);
      wr(WX.cloud, bx, by, rad * 3.6, rad * 1.2, 0);
    }
    // широкий фронт порыва, проносящийся по экрану
    var fp = wrap01(t * 0.0005);
    Draw.color(cSandCloud, 0.13 * Math.sin(fp * Math.PI) * a);
    wr(WX.cloud, left + (fp * 1.8 - 0.4) * cw, cy, cw * 0.7, ch * 1.4, 0);
  }

  // песчаные штрихи со скоростью, зависящей от порыва
  var cnt = Math.min(WN, Math.round(150 * qmv * a));
  for(i = 0; i < cnt; i++){
    var x = wxp(wpx[i] + t * 0.0055 * (0.6 + wpv[i] * 0.9) * (0.5 + 0.7 * gust), left, cw);
    var y = wyp(wpy[i] - t * 0.0006 * (0.5 + wps[i]) + Math.sin(t * 0.03 + wps[i] * 30) * 0.004, bottom, ch);
    Draw.color(cSandLine, (0.1 + 0.22 * wpv[i]) * (0.6 + 0.4 * gust) * a);
    wr(WX.streak, x, y, 1.4 + wpv[i] * 2.2, 26 + 44 * wpv[i], 84 + wpa[i] * 6);
  }

  // мелкий песок в воздухе
  var ng = Math.min(WN, Math.round(120 * qmv * a));
  Draw.color(cSandLine, 0.55 * a);
  for(i = 0; i < ng; i++){
    var gx = wxp(wpx[i] * 0.93 + 0.04 + t * 0.009 * (0.7 + wph[i]) * (0.5 + 0.6 * gust), left, cw);
    var gy = wyp(wpy[i] * 0.93 + 0.03 - t * 0.0012 + Math.sin(t * 0.05 + wps[i] * 40) * 0.003, bottom, ch);
    var gs = 1.4 + wpa[i] * 2;
    wr(WX.soft, gx, gy, gs, gs, 0);
  }
}

/* ----- споровая буря ----- */
function sporeFx(a, left, bottom, cw, ch, t, qmv, q){
  var cx = left + cw / 2, cy = bottom + ch / 2, i;

  Draw.color(cSporeTint, 0.12 * a);
  wFill(left, bottom, cw, ch);
  var add = q >= 1;
  if(add) Draw.blend(AdditiveBlend);
  // светящаяся рамка и дышащее свечение
  Draw.color(cSporeVig, (0.22 + 0.06 * Math.sin(t * 0.012)) * a);
  wr(WX.vig, cx, cy, cw * 1.04, ch * 1.04, 0);

  // фиолетовая дымка
  var nb = Math.round(7 * qmv * a) + 2;
  for(i = 0; i < nb; i++){
    var bx = wxp(wpx[i] + t * 0.0005 * (0.5 + wpv[i]), left, cw);
    var by = wyp(wpy[i] + Math.sin(t * 0.003 + wps[i] * 20) * 0.012, bottom, ch);
    var rad = 70 + wps[i] * 110;
    Draw.color(cSporeMist, 0.07 * a);
    wr(WX.cloud, bx, by, rad * 2.5, rad * 1.6, 0);
  }

  // светящиеся споры-«боке» с хвостами
  var cnt = Math.min(WN, Math.round(95 * qmv * a));
  for(i = 0; i < cnt; i++){
    var vxs = 0.0004 + Math.cos(t * 0.01 * (0.5 + wpv[i]) + wps[i] * 30) * 0.0003;
    var vys = 0.0009 * (0.4 + wpv[i]);
    var x = wxp(wpx[i] + Math.sin(t * 0.012 * (0.5 + wpv[i]) + wps[i] * 30) * 0.02 + t * 0.0004, left, cw);
    var y = wyp(wpy[i] + t * vys, bottom, ch);
    var pulse = 0.6 + 0.4 * Math.sin(t * 0.04 + wps[i] * 30);
    var pc = sporePal[Math.floor(wph[i] * sporePal.length) % sporePal.length];
    var sz = 9 + wps[i] * 20;
    Draw.color(pc[0], pc[1], pc[2], 0.22 * pulse * a);
    wr(WX.soft, x, y, sz * 2, sz * 2, 0);
    if(q >= 1 && wpa[i] > 0.55){
      Draw.color(pc[0], pc[1], pc[2], 0.28 * a);
      wr(WX.streak, x, y, 3.4, 14 + wpv[i] * 18, Math.atan2(vxs * cw, -vys * ch) * 180 / Math.PI);
    }
    Draw.color(1, 0.88, 1, 0.85 * pulse * a);
    var cs = 2 + wpv[i] * 2.4;
    wr(WX.soft, x, y, cs * 2, cs * 2, 0);
  }

  // мерцающая пыльца-искры
  if(q >= 1){
    var nst = Math.round(34 * qmv * a);
    for(i = 0; i < nst; i++){
      var tw = Math.sin(t * 0.045 * (0.5 + wpv[i]) + wps[i] * 50);
      if(tw < 0.6) continue;
      var sx = wxp(wpx[i] * 0.95 + 0.02 + t * 0.0003, left, cw), sy = wyp(wpy[i] * 0.95 + 0.02 + t * 0.0005, bottom, ch);
      var ssz = 6 + (tw - 0.6) * 30;
      Draw.color(1, 0.8, 1, (tw - 0.6) * 2.2 * a);
      wr(WX.star, sx, sy, ssz, ssz, t * 0.3 * (wph[i] - 0.5));
    }
  }
  if(add) Draw.blend();
}

function fogFx(a, left, bottom, cw, ch, t, qmv, q){
  var nb = Math.round(14 * qmv * a) + 3;
  for(var b = 0; b < nb; b++){
    var x = wxp(wpx[b] + t * 0.0006 * (0.5 + wpv[b]), left, cw);
    var y = wyp(wpy[b] + Math.sin(t * 0.003 + wps[b] * 20) * 0.01, bottom, ch);
    var rad = 70 + wps[b] * 110;
    Draw.color(cFog, 0.06 * a);
    wr(WX.cloud, x, y, rad * 2.6, rad * 1.7, 0);
  }
}

/* ----- молния: ветвистый разряд, свечение неба и земли, двойная вспышка, гром с задержкой ----- */
function drawThunder(a, left, bottom, cw, ch, t, cx, cy){
  if(pref("vo-lightning", true) && a > 0.55 && thunderFlash <= 0.01 && Mathf.chance(0.0005 * Time.delta)){
    thunderFlash = 1;
    thunderFlick = true;
    boltX = left + (0.15 + Mathf.random(0.7)) * cw;
    boltY = bottom + ch;
    boltH = ch * (0.55 + Mathf.random(0.35));
    boltSeed = Math.floor(Mathf.random(100000));
    Time.runTask(25 + Mathf.random(50), function(){
      try{ snd("boom", cx, cy, 0.45 + Mathf.random(0.1), 0.3); }catch(err){}
    });
  }
  if(thunderFlash <= 0.01) return;
  var f = thunderFlash;
  Draw.color(0.78, 0.88, 1, f * f * 0.30);
  wFill(left, bottom, cw, ch);
  Draw.blend(AdditiveBlend);
  Draw.color(0.55, 0.72, 1, f * 0.30);
  wr(WX.soft, boltX, boltY, cw * 1.5, ch * 1.0, 0);
  Draw.blend();
  var segs = 11, step = boltH / segs;
  var pxp = boltX, pyp = boltY, dir = (boltSeed % 2 == 0) ? 1 : -1;
  for(var i = 1; i <= segs; i++){
    var nx = pxp + Mathf.randomSeedRange(boltSeed + i, 30);
    var ny = boltY - step * i;
    Draw.color(cCyan, f * 0.25);
    Lines.stroke(9);
    Lines.line(pxp, pyp, nx, ny);
    Draw.color(0.7, 0.85, 1, f * 0.6);
    Lines.stroke(3.4);
    Lines.line(pxp, pyp, nx, ny);
    Draw.color(1, 1, 1, f);
    Lines.stroke(1.5);
    Lines.line(pxp, pyp, nx, ny);
    if(i % 3 == 1){
      var b1x = nx + dir * step * (0.7 + Mathf.randomSeed(boltSeed + i * 5) * 0.5), b1y = ny - step * 0.7;
      var b2x = b1x + dir * step * 0.5 + Mathf.randomSeedRange(boltSeed + i * 9, 14), b2y = b1y - step * 0.8;
      Draw.color(0.8, 0.9, 1, f * 0.75);
      Lines.stroke(1.1);
      Lines.line(nx, ny, b1x, b1y);
      Lines.line(b1x, b1y, b2x, b2y);
      dir = -dir;
    }
    pxp = nx; pyp = ny;
  }
  Draw.blend(AdditiveBlend);
  Draw.color(0.7, 0.85, 1, f * 0.7);
  wr(WX.soft, pxp, pyp, 170, 170, 0);
  Draw.color(1, 1, 1, f * 0.5);
  wr(WX.soft, pxp, pyp, 60, 60, 0);
  Draw.blend();
  thunderFlash = Math.max(0, thunderFlash - 0.04 * Time.delta);
  if(thunderFlick && thunderFlash < 0.45){ thunderFlash = 0.85; thunderFlick = false; }
}

/* ----- ванильные частицы погоды: выключаем, пока работает наша погода ----- */
var wxSup = {on: false, saved: []};
function weatherSuppress(on){
  if(on == wxSup.on) return;
  wxSup.on = on;
  try{
    var W = Packages.mindustry.content.Weathers;
    var names = ["snow", "sandstorm", "sporestorm"], i;
    if(on){
      wxSup.saved = [];
      for(i = 0; i < names.length; i++){
        var w = W[names[i]];
        if(w == null) continue;
        try{
          wxSup.saved.push({w: w, f: "drawParticles", v: w.drawParticles});
          wxSup.saved.push({w: w, f: "drawNoise", v: w.drawNoise});
          w.drawParticles = false; w.drawNoise = false;
        }catch(err){}
      }
      var r = W.rain;
      if(r != null){
        try{ wxSup.saved.push({w: r, f: "density", v: r.density}); r.density = 100000000; }catch(err){}
      }
    }else{
      for(i = 0; i < wxSup.saved.length; i++){
        try{ wxSup.saved[i].w[wxSup.saved[i].f] = wxSup.saved[i].v; }catch(err){}
      }
      wxSup.saved = [];
    }
  }catch(err){}
}

function drawWeather(){
  var n = Groups.weather.size();
  if(n == 0){ thunderFlash = 0; return; }
  wxInit();
  var q = qLevel(), qmv = qm();
  var cam = Core.camera;
  var cw = cam.width, ch = cam.height;
  var cx = cam.position.x, cy = cam.position.y;
  var left = cx - cw / 2, bottom = cy - ch / 2;
  var t = Time.time;
  var z0 = Draw.z();
  Draw.z(LayerClass.weather + 1);
  for(var i = 0; i < n; i++){
    var w = Groups.weather.index(i);
    if(w == null || w.weather == null) continue;
    var a = Mathf.clamp(w.opacity) * Mathf.clamp(w.intensity);
    if(a < 0.02) continue;
    var nm = String(w.weather.name);
    if(nm == "rain"){ rainFx(a, left, bottom, cw, ch, t, qmv, q); drawThunder(a, left, bottom, cw, ch, t, cx, cy); }
    else if(nm == "snow") snowFx(a, left, bottom, cw, ch, t, qmv, q);
    else if(nm == "sandstorm") sandFx(a, left, bottom, cw, ch, t, qmv, q);
    else if(nm == "sporestorm") sporeFx(a, left, bottom, cw, ch, t, qmv, q);
    else if(nm == "fog") fogFx(a, left, bottom, cw, ch, t, qmv, q);
  }
  Draw.reset();
  Draw.z(z0);
}

// обёртка: если красивая погода ломается, возвращаем ванильную, чтобы погода не пропала совсем
function drawWeatherSafe(){
  if(wxBroken){ weatherSuppress(false); return; }
  weatherSuppress(true);
  try{
    drawWeather();
    wxFails = 0;
  }catch(err){
    wxFails++;
    Draw.reset();
    fail("погода", err);
    if(wxFails > 5){ wxBroken = true; weatherSuppress(false); }
  }
}

/* ---------- подключение ---------- */

Events.run(EventType.Trigger.update, function(){
  if(Vars.headless || !Vars.state.isGame() || Vars.state.isPaused()) return;
  if(pref("vo-trails", true)) guard("следы юнитов", trackTrails);
  if(pref("vo-domefx", true)){
    domeTick++;
    if(domeTick % 40 == 1) guard("поиск куполов", refreshDomes);
  }
});

Events.run(EventType.Trigger.draw, function(){
  if(Vars.headless || !Vars.state.isGame()) return;
  if(pref("vo-domefx", true)) guard("силовые купола", drawDomes);
  if(pref("vo-weatherfx", true)) drawWeatherSafe(); else weatherSuppress(false);
});

Events.on(EventType.WorldLoadEvent, function(e){
  domeList = [];
  domeTick = 0;
  thunderFlash = 0;
});

/* ===================== v3.0: НОВЫЙ ИНТЕРФЕЙС «ПРИЗМА» =====================
   Совсем другой визуальный язык: скошенные (срезанные по диагонали) панели и кнопки, тонкая линия
   по краю, яркий срез и акцентная полоса слева у кнопок. Круглых углов и «ванильных» рамок нет.
   Анимации: окна выезжают и плавно меняют масштаб вместе с прозрачностью, кнопки мягко «дышат» при
   наведении и пружинят при нажатии, HUD плавно проявляется, капсула волны выезжает сверху.
   Каждый шаг в try/catch: если что-то в этой версии игры называется иначе - оно просто пропускается. */

var UiThemes = [
  {name: "Неон", a: [0.36, 0.90, 1.00]},
  {name: "Аметист", a: [0.72, 0.56, 1.00]},
  {name: "Закат", a: [1.00, 0.56, 0.40]},
  {name: "Изумруд", a: [0.38, 0.95, 0.68]},
  {name: "Рубин", a: [1.00, 0.34, 0.50]},
  {name: "Золото", a: [1.00, 0.82, 0.36]},
  {name: "Лёд", a: [0.82, 0.90, 1.00]}
];
var uiTheme = -1;
var uiStat = {ok: 0, fail: 0, failNames: []};
var uiItems = {};
var uiOld = [];          // пары [старый рисунок, новый] для замены в уже созданных окнах
var uiTickN = 0, uiClock = 0;

var PixmapClass = Packages.arc.graphics.Pixmap;
var TextureClass = Packages.arc.graphics.Texture;
var TextureFilterClass = Packages.arc.graphics.Texture.TextureFilter;
var TextureRegionClass = Packages.arc.graphics.g2d.TextureRegion;
var NinePatchClass = Packages.arc.graphics.g2d.NinePatch;
var NinePatchDrawableClass = Packages.arc.scene.style.NinePatchDrawable;
var RegionDrawableClass = Packages.arc.scene.style.TextureRegionDrawable;
var TableClass = Packages.arc.scene.ui.layout.Table;
var GroupClass = Packages.arc.scene.Group;
var ButtonClass = Packages.arc.scene.ui.Button;
var DialogClass = Packages.arc.scene.ui.Dialog;
var TexClass = Packages.mindustry.gen.Tex;
var StylesClass = Packages.mindustry.ui.Styles;
var PalClass = Packages.mindustry.graphics.Pal;

function c01(v){ return v < 0 ? 0 : (v > 1 ? 1 : v); }
function mixn(a, b, t){ return a + (b - a) * t; }
function packC(r, g, b, a){
  return (Math.round(c01(r) * 255) << 24) | (Math.round(c01(g) * 255) << 16) | (Math.round(c01(b) * 255) << 8) | Math.round(c01(a) * 255);
}
function easeOut(t){ t = c01(t); return 1 - (1 - t) * (1 - t) * (1 - t); }
function animOn(){ return pref("vo-uianim", true); }
function uiNote(ok, name){
  if(ok) uiStat.ok++;
  else{ uiStat.fail++; if(uiStat.failNames.length < 12) uiStat.failNames.push(name); }
}

// цветовые «рецепты»: только чёрный и серый, никакого синего; кнопки - обычные скруглённые прямоугольники
function uiSpecs(A){
  function n(v, a){ return [v, v, v, a]; }
  function R(top, bot, bor, rr){
    return {top: top, bot: bot, bor: bor, bw: 1.0, glow: 0, gw: 6, glowC: [1, 1, 1], strip: 0, sw: 0, stripC: [1, 1, 1],
            cutC: [1, 1, 1], cutA: 0, cutW: 0, rr: rr == null ? 3 : rr, sheen: 0};
  }
  var up = R(n(0.15, 0.95), n(0.11, 0.95), n(0.80, 0.14));
  var over = R(n(0.23, 0.96), n(0.18, 0.96), n(0.85, 0.30));
  var down = R(n(0.21, 0.98), n(0.15, 0.98), n(0.90, 0.36));
  return {
    soft:   R(n(0.05, 0.55), n(0.03, 0.55), n(0.80, 0.08)),
    mid:    R(n(0.07, 0.84), n(0.04, 0.88), n(0.80, 0.13)),
    solid:  R(n(0.045, 0.97), n(0.025, 0.98), n(0.80, 0.18)),
    btnUp: up, btnOver: over, btnDown: down,
    btnDis: R(n(0.08, 0.60), n(0.06, 0.60), n(0.50, 0.08)),
    btnChk: R(n(0.30, 0.97), n(0.24, 0.97), n(0.95, 0.50)),
    field:  R(n(0.03, 0.95), n(0.05, 0.95), n(0.80, 0.22)),
    knob:   R(n(0.72, 1), n(0.56, 1), n(0.92, 1), 2),
    track:  R(n(0.02, 0.90), n(0.05, 0.90), n(0.80, 0.16), 2),
    fill:   R(n(0.86, 1), n(0.70, 1), n(0.90, 1), 2),
    mUp: up, mOver: over, mDown: down,
    dia:    {A: [0.82, 0.84, 0.88], hi: [1, 1, 1]}
  };
}

// квадрат S×S со срезанными углами (верх-лево и низ-право): подходит для 9-patch
function paintPrism(pm, S, cut, sp){
  var useRaw = (typeof pm.setRaw === "function");
  var K = 0.70710678;
  for(var y = 0; y < S; y++){
    for(var x = 0; x < S; x++){
      var px = x + 0.5, py = y + 0.5;
      var dr = Math.max(Math.max(-px, px - S), Math.max(-py, py - S));
      if(sp.rr > 0){
        var ax = Math.abs(px - S / 2) - (S / 2 - sp.rr), ay = Math.abs(py - S / 2) - (S / 2 - sp.rr);
        dr = Math.sqrt(Math.max(ax, 0) * Math.max(ax, 0) + Math.max(ay, 0) * Math.max(ay, 0)) + Math.min(Math.max(ax, ay), 0) - sp.rr;
      }
      var dc = cut > 0 ? Math.max((cut - (px + py)) * K, ((px + py) - (2 * S - cut)) * K) : -1000000;
      var d = Math.max(dr, dc);
      var cov = c01(0.5 - d);
      var col;
      if(cov <= 0){
        col = 0;
      }else{
        var di = -d;
        var v = y / (S - 1);
        var r = mixn(sp.top[0], sp.bot[0], v), g = mixn(sp.top[1], sp.bot[1], v), b = mixn(sp.top[2], sp.bot[2], v);
        var a = mixn(sp.top[3], sp.bot[3], v);
        var sheen = c01(1 - v / 0.34) * (sp.sheen || 0);
        r += sheen; g += sheen; b += sheen;
        // внутреннее свечение у края
        var gf = c01(1 - di / sp.gw);
        gf = gf * gf * sp.glow;
        r = mixn(r, sp.glowC[0], gf); g = mixn(g, sp.glowC[1], gf); b = mixn(b, sp.glowC[2], gf);
        a = Math.max(a, gf * 0.9);
        // линия по краю; на диагональном срезе она толще и ярче
        var cw = cut > 0 ? c01((dc - dr) * 0.6 + 0.5) : 0;
        var bf = c01(sp.bw + cw * sp.cutW - di + 0.5) * mixn(sp.bor[3], sp.cutA, cw);
        r = mixn(r, mixn(sp.bor[0], sp.cutC[0], cw), bf);
        g = mixn(g, mixn(sp.bor[1], sp.cutC[1], cw), bf);
        b = mixn(b, mixn(sp.bor[2], sp.cutC[2], cw), bf);
        a = Math.max(a, bf);
        // акцентная полоса слева
        if(sp.strip > 0){
          var sf = c01(1 - (Math.abs(px - (6 + sp.sw / 2)) - sp.sw / 2)) * c01(di - 2.5) * sp.strip;
          r = mixn(r, sp.stripC[0], sf); g = mixn(g, sp.stripC[1], sf); b = mixn(b, sp.stripC[2], sf);
          a = Math.max(a, sf);
        }
        col = packC(r, g, b, a * cov);
      }
      if(useRaw) pm.setRaw(x, y, col); else pm.set(x, y, col);
    }
  }
}

// ромбик для ползунков
function paintDiamond(pm, S, sp){
  var useRaw = (typeof pm.setRaw === "function");
  var c = S / 2, rad = S / 2 - 1.5;
  for(var y = 0; y < S; y++){
    for(var x = 0; x < S; x++){
      var dd = Math.abs(x + 0.5 - c) + Math.abs(y + 0.5 - c) - rad;
      var cov = c01(0.5 - dd);
      var col = 0;
      if(cov > 0){
        var di = -dd;
        var core = c01((di - rad * 0.45) * 0.8 + 0.5);
        var r = mixn(sp.A[0], 1, core), g = mixn(sp.A[1], 1, core), b = mixn(sp.A[2], 1, core);
        var rim = c01(1.6 - di);
        r = mixn(r, sp.hi[0], rim); g = mixn(g, sp.hi[1], rim); b = mixn(b, sp.hi[2], rim);
        col = packC(r, g, b, cov);
      }
      if(useRaw) pm.setRaw(x, y, col); else pm.set(x, y, col);
    }
  }
}

function uiMakeTex(pm){
  var tex = new TextureClass(pm);
  try{ tex.setFilter(TextureFilterClass.linear, TextureFilterClass.linear); }catch(err){}
  return tex;
}

function uiAdd(key, specKey, S, cut, split, padX, padY){
  var specs = uiSpecs(UiThemes[Math.max(0, uiTheme)].a);
  var pm = new PixmapClass(S, S);
  paintPrism(pm, S, cut, specs[specKey]);
  var tex = uiMakeTex(pm);
  var patch = new NinePatchClass(new TextureRegionClass(tex), split, split, split, split);
  var d = new NinePatchDrawableClass(patch);
  try{
    d.setMinWidth(0); d.setMinHeight(0);
    d.setLeftWidth(padX); d.setRightWidth(padX); d.setTopHeight(padY); d.setBottomHeight(padY);
  }catch(err){}
  uiItems[key] = {kind: "prism", pm: pm, tex: tex, d: d, specKey: specKey, S: S, cut: cut};
}

function uiAddDiamond(key, S){
  var specs = uiSpecs(UiThemes[Math.max(0, uiTheme)].a);
  var pm = new PixmapClass(S, S);
  paintDiamond(pm, S, specs.dia);
  var tex = uiMakeTex(pm);
  var d = new RegionDrawableClass(new TextureRegionClass(tex));
  try{ d.setMinWidth(S - 2); d.setMinHeight(S - 2); }catch(err){}
  uiItems[key] = {kind: "dia", pm: pm, tex: tex, d: d, S: S};
}

function uiBuildItems(){
  uiAdd("soft", "soft", 32, 0, 8, 10, 8);
  uiAdd("mid", "mid", 32, 0, 8, 12, 9);
  uiAdd("solid", "solid", 32, 0, 8, 14, 11);
  uiAdd("btnUp", "btnUp", 32, 0, 8, 12, 6);
  uiAdd("btnOver", "btnOver", 32, 0, 8, 12, 6);
  uiAdd("btnDown", "btnDown", 32, 0, 8, 12, 6);
  uiAdd("btnDis", "btnDis", 32, 0, 8, 12, 6);
  uiAdd("btnChk", "btnChk", 32, 0, 8, 12, 6);
  uiAdd("mUp", "mUp", 32, 0, 8, 12, 6);
  uiAdd("mOver", "mOver", 32, 0, 8, 12, 6);
  uiAdd("mDown", "mDown", 32, 0, 8, 12, 6);
  uiAdd("field", "field", 32, 0, 8, 12, 6);
  uiAdd("knob", "knob", 16, 0, 5, 0, 0);
  try{ uiItems.knob.d.setMinWidth(8); uiItems.knob.d.setMinHeight(8); }catch(err){}
  uiAdd("track", "track", 16, 0, 4, 0, 0);
  try{ uiItems.track.d.setMinHeight(6); }catch(err){}
  uiAdd("fill", "fill", 16, 0, 4, 0, 0);
  try{ uiItems.fill.d.setMinHeight(6); }catch(err){}
  uiAddDiamond("dia", 24);
}

// смена темы «на лету»: перерисовываем те же текстуры + красим общий акцентный цвет игры
function uiApplyTheme(th){
  uiTheme = th;
  var A = UiThemes[th].a;
  var specs = uiSpecs(A);
  var failed = false;
  for(var k in uiItems){
    var it = uiItems[k];
    try{
      if(it.kind == "dia") paintDiamond(it.pm, it.S, specs.dia);
      else paintPrism(it.pm, it.S, it.cut, specs[it.specKey]);
      it.tex.draw(it.pm, 0, 0);
    }catch(err){ failed = true; }
  }
  try{ PalClass.accent.set(A[0], A[1], A[2], 1); }catch(err){}
  if(failed){
    try{ Vars.ui.showInfoToast("[accent]Тема интерфейса применится после перезапуска[]", 4); }catch(err){}
  }
}

// подмена рисунков, которыми игра красит панели и кнопки
function uiPatchDrawables(){
  var map = [
    [TexClass, "pane", "mid"], [TexClass, "paneLeft", "mid"], [TexClass, "paneRight", "mid"], [TexClass, "paneTop", "mid"],
    [TexClass, "paneSolid", "solid"], [TexClass, "windowEmpty", "solid"], [TexClass, "inventory", "mid"],
    [TexClass, "button", "btnUp"], [TexClass, "buttonOver", "btnOver"], [TexClass, "buttonDown", "btnDown"],
    [TexClass, "buttonDisabled", "btnDis"], [TexClass, "buttonSelect", "btnChk"],
    [TexClass, "buttonEdge1", "btnUp"], [TexClass, "buttonEdge2", "btnUp"], [TexClass, "buttonEdge3", "btnUp"], [TexClass, "buttonEdge4", "btnUp"],
    [TexClass, "buttonEdgeOver1", "btnOver"], [TexClass, "buttonEdgeOver2", "btnOver"], [TexClass, "buttonEdgeOver3", "btnOver"], [TexClass, "buttonEdgeOver4", "btnOver"],
    [TexClass, "buttonEdgeDown1", "btnDown"], [TexClass, "buttonEdgeDown2", "btnDown"], [TexClass, "buttonEdgeDown3", "btnDown"], [TexClass, "buttonEdgeDown4", "btnDown"],
    [TexClass, "buttonSideLeft", "btnUp"], [TexClass, "buttonSideLeftOver", "btnOver"], [TexClass, "buttonSideLeftDown", "btnDown"],
    [TexClass, "buttonSideRight", "btnUp"], [TexClass, "buttonSideRightOver", "btnOver"], [TexClass, "buttonSideRightDown", "btnDown"],
    [TexClass, "buttonSquare", "btnUp"], [TexClass, "buttonSquareOver", "btnOver"], [TexClass, "buttonSquareDown", "btnDown"],
    [StylesClass, "flatOver", "btnOver"], [StylesClass, "flatDown", "btnDown"],
    [StylesClass, "black3", "soft"], [StylesClass, "black5", "soft"], [StylesClass, "black6", "mid"], [StylesClass, "black8", "mid"]
  ];
  for(var i = 0; i < map.length; i++){
    var cls = map[i][0], nm = map[i][1], key = map[i][2];
    try{
      var old = cls[nm];
      if(old == null) continue;
      cls[nm] = uiItems[key].d;
      uiOld.push([old, uiItems[key].d]);
      uiNote(true, nm);
    }catch(err){ uiNote(false, nm); }
  }
}

function uiSet(o, k, v){ try{ o[k] = v; return true; }catch(err){ return false; } }

// стили кнопок, окон, полей, ползунков и полос прокрутки (они общие для всей игры и обновляются сразу)
function uiPatchStyles(){
  var I = uiItems;
  var full = ["defaultt", "togglet", "fullTogglet", "defaultb"];
  var flat = ["flatt", "cleart", "flatTogglet", "flatToggleMenut", "squareTogglet", "flatBordert", "clearTogglet", "clearb", "clearTransb", "clearNoneb", "clearToggleTransb"];
  var i, st, nm;
  for(i = 0; i < full.length; i++){
    nm = full[i];
    try{
      st = StylesClass[nm];
      if(st == null) continue;
      uiSet(st, "up", I.btnUp.d); uiSet(st, "over", I.btnOver.d); uiSet(st, "down", I.btnDown.d);
      uiSet(st, "disabled", I.btnDis.d); uiSet(st, "checked", I.btnChk.d); uiSet(st, "checkedOver", I.btnChk.d);
      uiNote(true, nm);
    }catch(err){ uiNote(false, nm); }
  }
  for(i = 0; i < flat.length; i++){
    nm = flat[i];
    try{
      st = StylesClass[nm];
      if(st == null) continue;
      uiSet(st, "over", I.btnOver.d); uiSet(st, "down", I.btnDown.d); uiSet(st, "checked", I.btnChk.d); uiSet(st, "checkedOver", I.btnChk.d);
      uiNote(true, nm);
    }catch(err){ uiNote(false, nm); }
  }
  var panes = ["defaultPane", "smallPane", "noBarPane", "horizontalPane"];
  for(i = 0; i < panes.length; i++){
    nm = panes[i];
    try{
      st = StylesClass[nm];
      if(st == null) continue;
      uiSet(st, "vScrollKnob", I.knob.d); uiSet(st, "hScrollKnob", I.knob.d);
      uiNote(true, nm);
    }catch(err){ uiNote(false, nm); }
  }
  try{
    st = StylesClass.defaultDialog;
    if(st != null){
      uiSet(st, "background", I.solid.d);
      uiSet(st, "titleFontColor", PalClass.accent);
      uiNote(true, "defaultDialog");
    }
  }catch(err){ uiNote(false, "defaultDialog"); }
  var fields = ["defaultField", "areaField"];
  for(i = 0; i < fields.length; i++){
    nm = fields[i];
    try{
      st = StylesClass[nm];
      if(st == null) continue;
      uiSet(st, "background", I.field.d); uiSet(st, "focusedBackground", I.field.d);
      uiNote(true, nm);
    }catch(err){ uiNote(false, nm); }
  }
  // ползунки: тонкая дорожка со срезом, залитая часть и ромбик вместо круглой ручки
  try{
    st = StylesClass.defaultSlider;
    if(st != null){
      uiSet(st, "background", I.track.d); uiSet(st, "knobBefore", I.fill.d);
      uiSet(st, "knob", I.dia.d); uiSet(st, "knobOver", I.dia.d); uiSet(st, "knobDown", I.dia.d);
      uiNote(true, "defaultSlider");
    }
  }catch(err){ uiNote(false, "defaultSlider"); }
}

// окна и панели, построенные ДО замены рисунков, держат старые ссылки - меняем их фон
function uiSwapBg(e){
  try{
    if(e instanceof TableClass){
      var bg = e.getBackground();
      if(bg != null){
        for(var i = 0; i < uiOld.length; i++){
          if(bg == uiOld[i][0]){ e.background(uiOld[i][1]); break; }
        }
      }
    }
    if(e instanceof GroupClass){
      var ch = e.getChildren();
      for(var j = 0; j < ch.size; j++) uiSwapBg(ch.get(j));
    }
  }catch(err){}
}

/* ---------- анимации ---------- */
// ВАЖНО: у Element есть только ОДИН слот update(Runnable), и игра сама им пользуется на кнопках,
// поэтому анимации кнопок и окон ведёт один общий счётчик (uiFrame), а не update каждой кнопки.
var btnList = [];
var btnSeen = new Packages.java.util.WeakHashMap();
var dlgList = [];
var dlgSeen = new Packages.java.util.WeakHashMap();
var scanQ = [], scanT = 0, rootCnt = -1, dlgT = 0;
var hudA = 1, hudBusy = false, btnBroken = false;

function regBtn(el){
  // v3.4.2: кнопки НЕ масштабируются и НЕ двигаются: это меняло зону нажатия и съедало касания
}

function resetEl(el){
  try{ el.scaleX = 1; el.scaleY = 1; el.translation.set(0, 0); }catch(err){}
}

function animButtons(dt){
  var k = 1 - Math.pow(0.80, dt);
  for(var i = btnList.length - 1; i >= 0; i--){
    var b = btnList[i], el = b.e;
    if(el.getScene() == null){
      resetEl(el);
      btnSeen.remove(el);
      btnList[i] = btnList[btnList.length - 1];
      btnList.pop();
      continue;
    }
    var w = Math.max(1, el.getWidth());
    var tgt = 1;
    var prs = el.isPressed();
    if(prs && !Core.input.isTouched()){ uiUnstick(el); prs = false; }
    if(prs) tgt = 1 - Math.min(0.06, 10 / w);
    else if(!Vars.mobile && el.isOver()) tgt = 1 + Math.min(0.05, 8 / w);
    b.s += (tgt - b.s) * k;
    if(Math.abs(b.s - tgt) < 0.0006) b.s = tgt;
    if(b.s != b.last){
      b.last = b.s;
      el.originX = el.getWidth() / 2; el.originY = el.getHeight() / 2;
      el.scaleX = b.s; el.scaleY = b.s;
    }
  }
}

function trackDialogs(dt){
  // v3.5.0: окна больше не масштабируются и не сдвигаются - это сбивало попадание пальцем по кнопкам внутри
  return;
}

// обходим дерево интерфейса понемногу за кадр, чтобы не было подвисаний
function scanStep(dt){
  return;
  if(scanQ.length == 0){
    scanT += dt;
    if(scanT < 20) return;
    scanT = 0;
    scanQ.push(Core.scene.root);
  }
  var n = 0;
  while(scanQ.length > 0 && n < 120){
    var e = scanQ.pop(); n++;
    if(e instanceof ButtonClass){ regBtn(e); continue; }
    if(e instanceof GroupClass){
      var ch = e.getChildren();
      for(var i = 0; i < ch.size; i++) scanQ.push(ch.get(i));
    }
  }
}

function hudFade(dt){
  if(!hudBusy) return;
  hudA += (1 - hudA) * (1 - Math.pow(0.93, dt));
  var g = Vars.ui.hudGroup;
  if(hudA > 0.995){ hudA = 1; hudBusy = false; }
  g.color.a = hudA;
  g.translation.y = (hudA - 1) * 40;
}

Events.on(EventType.WorldLoadEvent, function(e){
  guard("плавное проявление HUD", function(){
    if(!animOn() || !pref("vo-ui", true) || uiTheme < 0) return;
    hudA = 0; hudBusy = true;
    Vars.ui.hudGroup.color.a = 0;
  });
});

function uiFrame(){
  var dt = Math.min(4, Core.graphics.getDeltaTime() * 60);
  uiClock += dt;
  uiTickN++;
  if(uiTickN % 10 == 0){
    var th = Core.settings.getInt("vo-uitheme", 0);
    if(th != uiTheme && th >= 0 && th < UiThemes.length) guard("тема интерфейса", function(){ uiApplyTheme(th); });
  }
  try{ menuFrame(dt); }catch(err){ fail("меню", err); }
  try{ resFrame(dt); }catch(err){ fail("список ресурсов", err); }
  if(!animOn()) return;
  try{
    trackDialogs(dt);
    hudFade(dt);
    scanStep(dt);
    if(!btnBroken) animButtons(dt);
  }catch(err){
    btnBroken = true;
    fail("анимации интерфейса", err);
  }
}

/* ---------- капсула волны сверху экрана ---------- */
// выезжает сверху, номер волны «пружинит» при новой волне, полоса прогресса едет плавно и переливается
var capSt = null, capEl = null;
/* ---------- ВАНИЛЬНАЯ ПАНЕЛЬ ВОЛН / ВРАГОВ СВЕРХУ: прячем полностью ----------
   Ищем подписи панели по тексту из языкового файла игры («Волна {0}», «{0} врагов осталось» и т.п.),
   поднимаемся до ближайшего контейнера БЕЗ кнопок (кнопка пропуска волны остаётся) и прячем его каждый кадр. */
var waveS = {pats: null, hid: [], t: 0, n: 0, did: false};

function waveBuildPats(){
  var keys = ["wave", "wave.waiting", "wave.enemies", "wave.enemy", "wave.waveInProgress", "wave.countdown", "wave.guardianwarn", "wave.guardianwarn.one"];
  var pats = [];
  for(var i = 0; i < keys.length; i++){
    try{
      var t = String(Core.bundle.get(keys[i]));
      if(t == "" || t.indexOf("???") == 0) continue;
      t = menuNorm(t).replace(/\{0\}/g, "\u0001").replace(/[.*+?^$()|\[\]\\{}]/g, "\\$&").replace(/\u0001/g, ".*");
      pats.push(new RegExp("^" + t + "$"));
    }catch(err){}
  }
  return pats;
}

function waveCollect(e, d, out){
  var nm = String(e.name);
  if(nm == "vo-capsule" || nm == "vo-res" || nm == "vo-waves") return;
  if(e instanceof LabelCls){
    var txt = menuNorm(e.getText());
    if(txt == "") return;
    for(var i = 0; i < waveS.pats.length; i++){
      if(waveS.pats[i].test(txt)){ out.push(e); return; }
    }
    return;
  }
  if(d > 9 || e instanceof ButtonClass || !(e instanceof GroupClass)) return;
  var ch = e.getChildren();
  for(var j = 0; j < ch.size; j++) waveCollect(ch.get(j), d + 1, out);
}

function waveTarget(lab){
  var best = lab, p = lab.parent;
  var maxW = Core.scene.getWidth() * 0.5, maxH = Core.scene.getHeight() * 0.4;
  while(p != null && p != Vars.ui.hudGroup){
    if(p.getWidth() > maxW || p.getHeight() > maxH) break;
    if(menuFirst(p, ButtonClass, 0) != null) break;
    best = p; p = p.parent;
  }
  return best;
}

function waveFrame(dt, on){
  var i;
  if(!on){
    if(waveS.did){
      for(i = 0; i < waveS.hid.length; i++){ try{ waveS.hid[i].visible = true; }catch(err){} }
      waveS.hid = []; waveS.did = false; waveS.n = 0;
    }
    return;
  }
  waveS.t += dt;
  if(waveS.t > 30){
    waveS.t = 0;
    if(waveS.pats == null) waveS.pats = waveBuildPats();
    var labs = [];
    waveCollect(Vars.ui.hudGroup, 0, labs);
    for(i = 0; i < labs.length; i++){
      var tg = waveTarget(labs[i]);
      if(waveS.hid.indexOf(tg) < 0){ waveS.hid.push(tg); waveS.did = true; }
    }
  }
  for(i = waveS.hid.length - 1; i >= 0; i--){
    var e = waveS.hid[i];
    if(e.getScene() == null){ waveS.hid.splice(i, 1); continue; }
    if(e.visible) e.visible = false;
  }
  waveS.n = waveS.hid.length;
}

/* ---------- РЕСУРСЫ ЯДРА СВЕРХУ ---------- */
// Свой список ресурсов вместо ванильного (тот прячется): иконка + число, числа плавно «докручиваются»,
// при заполненном хранилище число краснеет. Список сам перестраивается, когда в ядре появляется новый ресурс.
var RES_SIDE_MOBILE = 300, RES_SIDE_DESKTOP = 240;   // сколько px с каждой стороны оставить свободным под кнопки HUD
function resScale(){ return Math.max(0.3, Math.min(1.5, Core.settings.getInt("vo-ressize", 50) / 100)); }   // 100% = прежний размер
function resCols(){ return Math.max(2, Math.min(10, Core.settings.getInt("vo-rescols", 6))); }
var resS = {root: null, wrap: null, box: null, cell: null, rows: {}, sig: "", per: 0, show: 0, lastPad: -1, lastSc: -1, padCell: null, van: null, vanT: 0, vanHid: false, tick: 0, ids: []};

function resCore(){
  try{ return Vars.player.team().core(); }catch(err){ return null; }
}

function resFmt(v){
  v = Math.floor(v + 0.5);
  if(v >= 1000000) return (v / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if(v >= 100000) return Math.floor(v / 1000) + "k";
  return "" + v;
}

function resItems(core){
  var out = [], all = Vars.content.items();
  for(var i = 0; i < all.size; i++){
    var it = all.get(i);
    try{ if(core.items.get(it) <= 0) continue; }catch(err){ continue; }
    try{ if(Vars.state.rules.hiddenBuildItems.contains(it)) continue; }catch(err){}
    out.push(it);
  }
  return out;
}

function resRebuild(items, per, sc){
  var box = resS.box;
  box.clearChildren();
  resS.rows = {};
  for(var i = 0; i < items.length; i++){
    var it = items[i];
    var chip = new TableClass();
    var icon = null;
    try{ icon = it.uiIcon; }catch(err){}
    if(icon == null){ try{ icon = it.fullIcon; }catch(err){} }
    if(icon != null){
      try{ chip.add(new ImageCls(icon)).size(18 * sc).padRight(5 * sc); }catch(err){}
    }
    var lbl = new LabelCls("0");
    lbl.setFontScale(0.9 * sc);
    chip.add(lbl).left().minWidth(38 * sc);
    box.add(chip).padLeft(8 * sc).padRight(8 * sc).padTop(2 * sc).padBottom(2 * sc);
    if((i + 1) % per == 0) box.row();
    resS.rows[it.id] = {lbl: lbl, it: it, disp: -1, txt: "", red: false};
  }
  box.invalidateHierarchy();
}

function resFindVanilla(e, d){
  if(e == resS.root) return null;
  var isC = false;
  try{ isC = (e instanceof Packages.mindustry.ui.CoreItemsDisplay); }catch(err){}
  if(isC || String(e.name) == "coreitems") return e;
  if(d > 7 || !(e instanceof GroupClass)) return null;
  var ch = e.getChildren();
  for(var i = 0; i < ch.size; i++){
    var r = resFindVanilla(ch.get(i), d + 1);
    if(r != null) return r;
  }
  return null;
}

function resHideVanilla(on){
  var v = resS.van;
  if(v == null || v.getScene() == null){
    resS.vanT++;
    if(!on || resS.vanT % 30 != 1) return;
    v = resFindVanilla(Vars.ui.hudGroup, 0);
    resS.van = v;
  }
  if(v == null) return;
  if(on){ if(v.visible){ v.visible = false; resS.vanHid = true; } }
  else if(resS.vanHid){ v.visible = true; resS.vanHid = false; }
}

function resFrame(dt){
  var on = pref("vo-res", true) && resS.root != null;
  resHideVanilla(on);
  waveFrame(dt, on);
  if(resS.root == null) return;
  var core = resCore();
  var vis = on && Vars.state.isGame() && core != null;
  resS.show += ((vis ? 1 : 0) - resS.show) * (1 - Math.pow(0.88, dt));
  if(Math.abs((vis ? 1 : 0) - resS.show) < 0.002) resS.show = vis ? 1 : 0;
  var e = animOn() ? easeOut(resS.show) : (vis ? 1 : 0);
  resS.root.visible = resS.show > 0.003;
  var scP = resScale();
  if(resS.padCell != null && scP != resS.lastSc){
    resS.lastSc = scP;
    resS.padCell.pad(4 * scP);
    resS.wrap.invalidateHierarchy();
  }
  resS.wrap.color.a = e;
  resS.wrap.translation.y = (e - 1) * 50;
  if(!vis || core == null) return;

  // состав списка проверяем раз в 10 кадров
  resS.tick++;
  if(resS.tick % 10 == 1){
    // панель по центру, поэтому с обеих сторон резервируем место под кнопки HUD (меню/пауза слева, миникарта справа)
    var side = Vars.mobile ? RES_SIDE_MOBILE : RES_SIDE_DESKTOP;
    var sc = resScale();
    var per = Math.max(2, Math.min(resCols(), Math.floor((Core.scene.getWidth() - 2 * side - 24) / (80 * sc))));
    var items = resItems(core);
    var sig = per + ":" + sc + ":";
    for(var i = 0; i < items.length; i++) sig += items[i].id + ",";
    if(sig != resS.sig){ resS.sig = sig; resRebuild(items, per, sc); }
  }
  // отступ сверху: ниже капсулы волны, пока она на экране
  var pad = 8;
  if(capSt != null && capEl != null) pad += easeOut(capSt.show) * (capEl.getHeight() + 6);
  if(Math.abs(pad - resS.lastPad) > 0.5){
    resS.lastPad = pad;
    resS.cell.padTop(pad);
    resS.root.invalidateHierarchy();
  }
  var k = 1 - Math.pow(0.80, dt), cap = 0;
  try{ cap = core.storageCapacity; }catch(err){}
  for(var id in resS.rows){
    var r = resS.rows[id], tgt = 0;
    try{ tgt = core.items.get(r.it); }catch(err){ continue; }
    if(r.disp < 0) r.disp = tgt;
    r.disp += (tgt - r.disp) * k;
    if(Math.abs(r.disp - tgt) < 0.5) r.disp = tgt;
    var txt = resFmt(r.disp);
    if(txt != r.txt){ r.txt = txt; r.lbl.setText(txt); }
    var red = cap > 0 && tgt >= cap;
    if(red != r.red){ r.red = red; if(red) r.lbl.setColor(1, 0.45, 0.4, 1); else r.lbl.setColor(1, 1, 1, 1); }
  }
}

function uiAddRes(){
  var root = new TableClass();
  root.name = "vo-res";
  root.setFillParent(true);
  root.touchable = Packages.arc.scene.event.Touchable.childrenOnly;
  root.top();
  var wrap = new TableClass();
  wrap.background(uiItems.mid.d);
  wrap.setTransform(true);
  var box = new TableClass();
  resS.padCell = wrap.add(box).pad(4);
  resS.cell = root.add(wrap).padTop(8);
  resS.root = root; resS.wrap = wrap; resS.box = box;
  root.visible = false;
  Vars.ui.hudGroup.addChild(root);
}

function uiAddCapsule(){
  var root = new TableClass();
  root.name = "vo-capsule";
  root.setFillParent(true);
  root.touchable = Packages.arc.scene.event.Touchable.childrenOnly;
  root.top();

  var cap = new TableClass();
  cap.background(uiItems.mid.d);
  cap.setTransform(true);

  var LabelClass = Packages.arc.scene.ui.Label;
  var lw = new LabelClass(""), lt = new LabelClass(""), le = new LabelClass("");
  lw.setFontScale(1.1);
  var st = {show: 0, punch: 0, wave: -1, f: 0};
  capSt = st; capEl = cap;
  lw.update(function(){
    lw.setText("[accent]ВОЛНА[] " + Vars.state.wave);
  });
  lt.update(function(){
    var s = Math.max(0, Math.ceil(Vars.state.wavetime / 60));
    var txt;
    if(!Vars.state.rules.waveTimer) txt = "[lightgray]ожидание[]";
    else txt = Math.floor(s / 60) + ":" + (s % 60 < 10 ? "0" : "") + (s % 60);
    lt.setText(txt);
  });
  le.update(function(){
    var n = Vars.state.enemies;
    le.setText((n > 0 ? "[scarlet]" : "[lightgray]") + "враги " + n + "[]");
  });
  cap.add(lw).padLeft(16).padRight(12);
  cap.add(lt).padRight(16).row();

  var barBg = new Packages.arc.scene.ui.Image(TexClass.whiteui);
  barBg.setColor(0, 0, 0, 0.5);
  var fillT = new TableClass();
  fillT.left();
  var fillImg = new Packages.arc.scene.ui.Image(TexClass.whiteui);
  var BW = 220;
  var fillCell = fillT.add(fillImg).height(3).width(1).left();
  var stack = new Packages.arc.scene.ui.layout.Stack();
  stack.add(barBg);
  stack.add(fillT);
  fillImg.update(function(){
    var spacing = Math.max(1, Vars.state.rules.waveSpacing);
    var target = Vars.state.rules.waveTimer ? c01(1 - Vars.state.wavetime / spacing) : 1;
    st.f += (target - st.f) * 0.14;
    fillCell.width(Math.max(1, st.f * BW));
    fillT.invalidate();
    var s = Vars.state.wavetime / 60;
    var sh = 0.5 + 0.5 * Math.sin(uiClock * 0.12);
    if(Vars.state.rules.waveTimer && s < 10){
      var p = 0.5 + 0.5 * Math.sin(uiClock * 0.35);
      fillImg.setColor(1, 0.30 + 0.35 * p, 0.30, 1);
    }else{
      var A = PalClass.accent;
      fillImg.setColor(mixn(A.r, 1, sh * 0.45), mixn(A.g, 1, sh * 0.45), mixn(A.b, 1, sh * 0.45), 1);
    }
  });
  cap.add(stack).colspan(2).width(BW).height(3).padBottom(9).padTop(1);

  cap.update(function(){
    var dt = Math.min(4, Core.graphics.getDeltaTime() * 60);
    var vis = Vars.state.isGame() && Vars.state.rules.waves && pref("vo-hudbar", true);
    st.show += ((vis ? 1 : 0) - st.show) * (1 - Math.pow(0.88, dt));
    if(Math.abs((vis ? 1 : 0) - st.show) < 0.002) st.show = vis ? 1 : 0;
    if(Vars.state.wave != st.wave){
      if(st.wave >= 0) st.punch = 1;
      st.wave = Vars.state.wave;
    }
    st.punch = Math.max(0, st.punch - 0.035 * dt);
    var spring = Math.sin(st.punch * Math.PI) * 0.12;
    var sc = animOn() ? 1 + spring : 1;
    cap.originX = cap.getWidth() / 2; cap.originY = cap.getHeight() / 2;
    cap.scaleX = sc; cap.scaleY = sc;
    var e = animOn() ? easeOut(st.show) : (vis ? 1 : 0);
    cap.translation.y = (e - 1) * 70;
    cap.color.a = e;
  });

  root.add(cap).padTop(8);
  root.update(function(){
    root.visible = st.show > 0.003 || (Vars.state.isGame() && Vars.state.rules.waves);
  });
  Vars.ui.hudGroup.addChild(root);
}

function uiAddTicker(){
  var tk = new TableClass();
  tk.touchable = Packages.arc.scene.event.Touchable.disabled;
  tk.update(function(){
    uiFrame();
    if(uiTickN % 30 == 0) uiSwapBg(Core.scene.root);
  });
  Core.scene.root.addChild(tk);
}

/* ---------- НОВОЕ ГЛАВНОЕ МЕНЮ ----------
   Ванильные плитки не удаляются: они прячутся, а наши строки нажимают их же (fireClick),
   поэтому все проверки игры (ошибки модов и т.п.) работают как раньше.
   Если найдено меньше 6 из 8 кнопок - стандартное меню остаётся нетронутым. */
var MenuKeys = [
  {k: "campaign", icon: "play"}, {k: "joingame", icon: "add"}, {k: "customgame", icon: "rightOpen"}, {k: "loadgame", icon: "download"},
  {k: "editor", icon: "terrain"}, {k: "settings", icon: "settings"}, {k: "mods", icon: "book"}, {k: "quit", icon: "exit"}
];
var LabelCls = Packages.arc.scene.ui.Label;
var ImageCls = Packages.arc.scene.ui.Image;
var menuS = {cont: null, built: false, tries: 0, scanT: 0, t: 0, wasVis: false, rows: [], vanilla: {}, root: null, lineP: 0, col: null, shown: false, colT: 0};

function menuNorm(s){ return String(s).replace(/\[[^\]]*\]/g, "").replace(/\s+/g, " ").trim().toLowerCase(); }

function menuCollect(e, out, depth){
  if(e == menuS.root || depth > 8) return;
  if(e instanceof ButtonClass){ out.push(e); return; }
  if(e instanceof GroupClass){
    var ch = e.getChildren();
    for(var i = 0; i < ch.size; i++) menuCollect(ch.get(i), out, depth + 1);
  }
}

function menuFirst(e, cls, depth){
  if(e instanceof cls) return e;
  if(depth > 6 || !(e instanceof GroupClass)) return null;
  var ch = e.getChildren();
  for(var i = 0; i < ch.size; i++){
    var r = menuFirst(ch.get(i), cls, depth + 1);
    if(r != null) return r;
  }
  return null;
}

// ищем ванильные кнопки меню по их подписям
function menuFindVanilla(){
  var want = {}, i;
  for(i = 0; i < MenuKeys.length; i++) want[menuNorm(Core.bundle.get(MenuKeys[i].k))] = MenuKeys[i].k;
  var btns = [];
  menuCollect(Vars.ui.menuGroup, btns, 0);
  var found = {}, n = 0;
  for(i = 0; i < btns.length; i++){
    var lab = menuFirst(btns[i], LabelCls, 0);
    if(lab == null) continue;
    var key = want[menuNorm(lab.getText())];
    if(key != null && found[key] == null){
      found[key] = {b: btns[i], img: menuFirst(btns[i], ImageCls, 0)};
      n++;
    }
  }
  return {found: found, n: n};
}

function menuIsAncestor(a, e){
  var p = e;
  while(p != null){ if(p == a) return true; p = p.parent; }
  return false;
}

// общий контейнер ванильных плиток (его прячем целиком и каждый кадр - иначе при пересборке меню они мелькают)
function menuFindContainer(found){
  for(var k in found){
    var b = found[k].b, p = b.parent, best = p;
    while(p != null && p != Vars.ui.menuGroup){
      if(String(p.name) == "menu container"){ best = p; break; }
      p = p.parent;
    }
    return best;
  }
  return null;
}

// угловые кнопки (консоль и «i») из левого нижнего угла - в левый верхний
function menuMoveCorner(){
  try{
    var AlignC = Packages.arc.util.Align;
    var ch = Vars.ui.menuGroup.getChildren();
    for(var i = 0; i < ch.size; i++){
      var c = ch.get(i);
      if(c == menuS.root || !(c instanceof TableClass) || c instanceof ButtonClass) continue;
      if(menuS.cont != null && menuIsAncestor(c, menuS.cont)) continue;
      if(menuFirst(c, ButtonClass, 0) == null) continue;
      var al = c.getAlign();
      if((al & AlignC.left) != 0 && (al & AlignC.bottom) != 0){ c.top(); c.invalidateHierarchy(); }
    }
  }catch(err){ fail("перенос угловых кнопок", err); }
}

// если кнопка «думает», что её держат, а касания на экране уже нет - сбрасываем её состояние
function uiUnstick(el){
  try{ var cl = el.getClickListener(); if(cl != null){ try{ cl.clear(); }catch(e1){} try{ cl.cancel(); }catch(e2){} } }catch(err){}
  try{ Core.scene.cancelTouchFocus(el); }catch(err2){}
}

function menuClick(key){
  var u = Vars.ui;
  // действия вызываются напрямую: скрытые ванильные кнопки больше не нужны для нажатия
  try{
    if(key == "campaign" || key == "joingame" || key == "customgame" || key == "loadgame" || key == "editor"){
      if(Vars.mods != null && Vars.mods.hasContentErrors()){ u.showInfoFade("@mod.noerrorplay"); return; }
    }
  }catch(err0){}
  try{
    if(key == "campaign") u.planet.show();
    else if(key == "joingame") u.join.show();
    else if(key == "customgame") u.custom.show();
    else if(key == "loadgame") u.load.show();
    else if(key == "editor") u.maps.show();
    else if(key == "settings") u.settings.show();
    else if(key == "mods") u.mods.show();
    else if(key == "quit") Core.app.exit();
    return;
  }catch(err){}
  try{ menuS.vanilla[key].fireClick(); }catch(err2){ fail("меню: " + key, err2); }
}

function menuMakeStyle(){
  try{
    var s = new Packages.arc.scene.ui.TextButton.TextButtonStyle();
    s.up = uiItems.mUp.d; s.over = Vars.mobile ? uiItems.mUp.d : uiItems.mOver.d; s.down = uiItems.mDown.d;
    s.disabled = uiItems.mUp.d; s.checked = uiItems.mOver.d; s.checkedOver = uiItems.mOver.d;
    s.font = Packages.mindustry.ui.Fonts.def;
    s.fontColor = Color.white;
    return s;
  }catch(err){ return null; }
}

var MENU_SLACK = 24;   // запас справа: на столько кнопка может выехать вправо

function menuAddRow(col, key, info, rowH, W, style, idx){
  // wrap - невидимая НЕПОДВИЖНАЯ зона нажатия; inner - сама кнопка (фон + значок + текст), она выезжает внутри wrap.
  // Так двигается вся кнопка целиком, а касания пальца не теряются.
  var wrap = new TableClass();
  wrap.touchable = Packages.arc.scene.event.Touchable.enabled;
  wrap.left();
  var inner = new TableClass();
  inner.touchable = Packages.arc.scene.event.Touchable.disabled;
  inner.left();
  var row = {b: wrap, inner: inner, img: null, lbl: null, i: idx, h: 0, p: 0, f: 0, stuck: 0, off: -9999, cell: null, cl: null, intro: 0};
  var cl = extend(Packages.arc.scene.event.ClickListener, {
    clicked: function(event, x, y){ row.f = 1; menuClick(key); }
  });
  try{ cl.setTapSquareSize(Math.max(40, rowH)); }catch(err){}   // дрожь пальца не отменяет нажатие
  wrap.addListener(cl);
  row.cl = cl;
  var bg = extend(Packages.arc.scene.style.BaseDrawable, {
    draw: function(x, y, w, h){
      if(arguments.length > 4) return;
      var I = uiItems, d = null;
      try{ d = row.p > 0.5 ? I.mDown.d : (row.h > 0.5 ? I.mOver.d : I.mUp.d); }catch(e){}
      var a = row.intro;
      if(d != null){ Draw.color(1, 1, 1, a); d.draw(x, y, w, h); }
      else{ Draw.color(0.1, 0.11, 0.14, 0.85 * a); Fill.rect(x + w / 2, y + h / 2, w, h); }
      var A = PalClass.accent, hp = Math.max(row.h, row.p);
      Draw.color(A, a * (0.55 + 0.45 * hp));
      Fill.rect(x + 2, y + h / 2, 3, h * (0.25 + 0.75 * hp));
      if(row.f > 0.01){ Draw.color(A, 0.35 * row.f * a); Fill.rect(x + w / 2, y + h / 2, w, h); }
      Draw.reset();
    }
  });
  inner.background(bg);
  var dr = null;
  try{ if(info.img != null) dr = info.img.getDrawable(); }catch(err){}
  if(dr == null){
    for(var i = 0; i < MenuKeys.length; i++) if(MenuKeys[i].k == key) dr = Packages.mindustry.gen.Icon[MenuKeys[i].icon];
  }
  var img = null;
  if(dr != null){
    img = new ImageCls(dr);
    img.setColor(0.88, 0.90, 0.94, 1);
    inner.add(img).size(rowH * 0.52).padLeft(10).padRight(14);
  }else{
    inner.add().width(rowH * 0.52 + 24);
  }
  var lbl = new LabelCls(Core.bundle.get(key));
  lbl.setFontScale(Math.max(0.8, Math.min(1.1, rowH / 40)));
  inner.add(lbl).left().growX();
  row.img = img; row.lbl = lbl;
  row.cell = wrap.add(inner).size(W, rowH).padLeft(0);
  col.add(wrap).size(W + MENU_SLACK, rowH).padBottom(6);
  col.row();
  menuS.rows.push(row);
}

function menuTryBuild(){
  var res = menuFindVanilla();
  if(res.n < 6){
    if(menuS.tries == 6){
      try{ Vars.ui.showInfoToast("[accent]Меню: найдено кнопок " + res.n + "/8, оставил стандартное[]", 5); }catch(err){}
    }
    return;
  }
  var H = Core.scene.getHeight();
  var rowH = Math.max(28, Math.min(48, H * 0.74 / 8 - 5));
  var W = 330;
  var root = new TableClass();
  root.name = "vo-menu";
  root.setFillParent(true);
  root.touchable = Packages.arc.scene.event.Touchable.childrenOnly;
  root.left().bottom();
  var col = new TableClass();
  col.left();
  var style = menuMakeStyle();
  var idx = 0;
  for(var i = 0; i < MenuKeys.length; i++){
    var key = MenuKeys[i].k, info = res.found[key];
    if(info == null) continue;
    menuS.vanilla[key] = info.b;
    menuAddRow(col, key, info, rowH, W, style, idx++);
  }
  root.add(col).padLeft(44).padBottom(Math.max(8, H * 0.06));
  root.update(function(){ root.visible = Vars.state.isMenu(); });
  menuS.root = root;
  menuS.col = col;
  menuS.cont = menuFindContainer(res.found);
  if(menuS.cont != null) menuS.cont.visible = false;
  Vars.ui.menuGroup.addChild(root);
  // прячем ванильные плитки
  for(var k in res.found){ try{ res.found[k].b.visible = false; }catch(err){} }
  try{ menuDeco.setFillParent(true); menuDeco.touchable = Packages.arc.scene.event.Touchable.disabled; Vars.ui.menuGroup.addChild(menuDeco); }catch(err){ fail("оформление меню", err); }
  menuS.built = true;
  menuS.t = 0;
  menuMoveCorner();
}

// вертикальная линия слева от меню: «вырастает» при появлении, по ней бегут огоньки
var menuLineC = new Color(0.86, 0.89, 0.95, 1);
var menuDeco = extend(Packages.arc.scene.Element, {
  draw: function(){
    if(!menuS.built || !Vars.state.isMenu() || menuS.col == null) return;
    var c = menuS.col;
    var x = c.x - 14, y0 = c.y, hh = c.getHeight() * menuS.lineP;
    if(hh < 2) return;
    var A = menuLineC, t = uiClock;
    Draw.color(A);
    Draw.alpha(0.22);
    Fill.rect(x, y0 + hh / 2, 6, hh);
    Draw.alpha(0.85);
    Fill.rect(x, y0 + hh / 2, 2, hh);
    Draw.blend(AdditiveBlend);
    for(var i = 0; i < 3; i++){
      var f = ((t * 0.0045) + i / 3) % 1;
      var py = y0 + f * hh;
      Draw.color(A); Draw.alpha(0.55 * Math.sin(f * Math.PI));
      Fill.circle(x, py, 5);
      Draw.color(Color.white); Draw.alpha(0.8 * Math.sin(f * Math.PI));
      Fill.circle(x, py, 1.8);
    }
    Draw.blend();
    Draw.reset();
  }
});

function animMenu(dt){
  var vis = Vars.state.isMenu();
  if(vis && !menuS.wasVis){
    menuS.t = 0;     // меню показано заново - играем появление и сбрасываем зависшие нажатия
    for(var u = 0; u < menuS.rows.length; u++){
      var rr = menuS.rows[u];
      try{ rr.cl.cancel(); }catch(e0){}
      uiUnstick(rr.b);
      rr.h = 0; rr.p = 0; rr.f = 0; rr.off = -9999;
    }
  }
  menuS.wasVis = vis;
  if(!vis) return;
  var an = animOn();
  menuS.t += dt;
  menuS.lineP = an ? easeOut((menuS.t - 3) / 28) : 1;
  var kk = 1 - Math.pow(0.78, dt);
  var touched = false;
  try{ touched = Core.input.isTouched(); }catch(e1){}
  var A = PalClass.accent;
  for(var i = 0; i < menuS.rows.length; i++){
    var r = menuS.rows[i];
    var intro = an ? easeOut((menuS.t - r.i * 3) / 20) : 1;
    var pressed = false, over = false;
    try{
      pressed = r.cl.isPressed();
      over = !Vars.mobile && r.cl.isOver() && !pressed;
    }catch(e2){}
    // страховка от «залипшего» нажатия: только если палец давно поднят
    if(pressed && !touched){
      r.stuck++;
      if(r.stuck >= 4){ try{ r.cl.cancel(); }catch(e3){} uiUnstick(r.b); r.stuck = 0; pressed = false; }
    }else r.stuck = 0;
    r.h += ((over ? 1 : 0) - r.h) * kk;
    r.p += ((pressed ? 1 : 0) - r.p) * kk;
    r.f = Math.max(0, r.f - 0.06 * dt);
    r.intro = intro;
    // «выдвижение»: сдвигается вся кнопка целиком, а невидимая зона нажатия под ней стоит на месте
    var off = (1 - intro) * -150 + r.h * 10 + r.p * 20;
    if(r.cell != null && Math.abs(off - r.off) > 0.05){
      r.off = off;
      r.cell.padLeft(off);
      r.b.invalidate();
    }
    r.inner.color.a = intro;
    try{
      var k2 = Math.min(1, r.h * 0.6 + r.p * 0.4 + r.f * 0.5);
      r.lbl.color.set(Color.white).lerp(A, k2);
      if(r.img != null) r.img.color.set(0.88, 0.90, 0.94, 1).lerp(A, k2);
    }catch(e4){}
  }
}

function menuFrame(dt){
  if(!pref("vo-newmenu", true)) return;
  if(!menuS.built){
    menuS.scanT += dt;
    if(menuS.scanT < 6 || menuS.tries > 120) return;
    menuS.scanT = 0; menuS.tries++;
    menuTryBuild();
    return;
  }
  animMenu(dt);
  // если игра пересобрала ванильное меню - прячем новые плитки снова
  if(menuS.cont != null && menuS.cont.visible) menuS.cont.visible = false;
  menuS.colT += dt;
  if(menuS.colT > 8){
    menuS.colT = 0;
    var res = menuFindVanilla();
    for(var k in res.found){
      var b = res.found[k].b;
      if(b.visible){ b.visible = false; menuS.vanilla[k] = b; }
    }
    if(res.n > 0 && (menuS.cont == null || menuS.cont.getScene() == null)){
      menuS.cont = menuFindContainer(res.found);
      if(menuS.cont != null) menuS.cont.visible = false;
    }
    menuMoveCorner();
  }
}

function installUI(){
  var th = Core.settings.getInt("vo-uitheme", 0);
  if(th < 0 || th >= UiThemes.length) th = 0;
  uiTheme = th;
  uiBuildItems();
  try{ PalClass.accent.set(UiThemes[th].a[0], UiThemes[th].a[1], UiThemes[th].a[2], 1); }catch(err){}
  uiPatchDrawables();
  uiPatchStyles();
  uiSwapBg(Core.scene.root);
  // капсула волны сверху по центру удалена по просьбе автора: не создаётся и не имеет настройки
  try{ uiAddRes(); }catch(err){ fail("список ресурсов", err); }
  try{ uiAddTicker(); }catch(err){ fail("обновление интерфейса", err); }
  try{ if(pref("vo-newmenu", true)) menuTryBuild(); }catch(err){ fail("меню", err); }
  try{
    Vars.ui.showInfoToast("[accent]Интерфейс 3.0 «Призма»: " + UiThemes[th].name + "[]", 4);
  }catch(err){}
}

Events.on(EventType.ClientLoadEvent, function(e){
  var bad = [];
  try{ addSettings(); }catch(err){ bad.push("настройки"); fail("настройки", err); }
  try{ addHud(); }catch(err){ bad.push("кнопка волн"); fail("кнопка волн", err); }
  Time.runTask(30, function(){ installPlanetFx(); installMenuFx(); });
  if(pref("vo-ui", true)) Time.runTask(1, function(){ try{ installUI(); }catch(err){ fail("интерфейс", err); } });
  Time.runTask(120, function(){
    try{
      if(bad.length == 0) Vars.ui.showInfoToast("[accent]Visual Overhaul " + VO_VERSION + " загружен[]", 4);
    }catch(err){}
  });
});

/* ===================== v3.6: ПОЛОСКИ ЗДОРОВЬЯ, ЦИФРЫ УРОНА, ЭЛЕКТРИЧЕСТВО, КОНВЕЙЕРЫ =====================
   Геймплей не затронут: всё считается по чтению полей юнитов и зданий, ничего не меняется в самой игре.
   Настройки: vo-hpbars, vo-dmgnums, vo-powerfx, vo-convfx. Качество берётся из vo-quality. */

var FontsC = Packages.mindustry.ui.Fonts;
var SclC = Packages.arc.scene.ui.layout.Scl;
var AlignC = Packages.arc.util.Align;
var BlendC = Packages.arc.graphics.Blending;
var IntSetC = Packages.arc.struct.IntSet;
var PowerNodeClass = Packages.mindustry.world.blocks.power.PowerNode;
var ConveyorClass = Packages.mindustry.world.blocks.distribution.Conveyor;
var ConstructBlockClass = Packages.mindustry.world.blocks.ConstructBlock;

function zOf(v, d){ return (v !== undefined && v !== null && !isNaN(v)) ? Number(v) : d; }
var Z_BARS = zOf(LayerClass.playerName, 150) - 1;
var Z_TXT = zOf(LayerClass.playerName, 150) + 1;
var Z_POWER = zOf(LayerClass.power, 70) + 1;
var Z_CONV = zOf(LayerClass.blockOver, 35) + 1;

var hpRed = col("ff3b3b"), hpOra = col("ff8a3a"), hpYel = col("ffd83a"), hpGrn = col("5dff7a");
var hpTmp = new Color(), dmgCol = new Color(), dmgDraw = new Color();
var pwCol = new Color(), pwCore = new Color(), cvSpark = new Color();

/* ---------- здоровье: состояние каждой раненой сущности ---------- */

var HP_U = {}, HP_B = {};              // состояния по id (юниты / здания)
var hpList = [];                       // все отслеживаемые сейчас
var hpFullU = new IntSetC(), hpFullB = new IntSetC();   // кого уже видели здоровым
var hpPrimed = false, hpScan = 0;
var dmgNums = [];                      // летящие цифры
var HP_STRIDE = 6;                     // здания проверяются по 1/6 за кадр

function hpOf(e){ var v = e.health; return (typeof v === "function") ? e.health() : v; }
// У зданий поле maxHealth может отдавать значение по умолчанию (1), поэтому берём максимум из всех источников
function mxOf(e){
  var v = e.maxHealth;
  if(typeof v === "function") v = e.maxHealth();
  var best = (v > 0) ? v : 0;
  var bl = e.block;
  if(bl !== undefined && bl != null){
    if(bl.health > best) best = bl.health;
  }else if(best <= 1){
    var ty = e.type;
    if(ty !== undefined && ty != null && ty.health > best) best = ty.health;
  }
  return best;
}

// цвет по состоянию: красный -> оранжевый -> жёлтый -> зелёный
function hpColor(f, out){
  if(f < 0.3) out.set(hpRed).lerp(hpOra, f / 0.3);
  else if(f < 0.6) out.set(hpOra).lerp(hpYel, (f - 0.3) / 0.3);
  else out.set(hpYel).lerp(hpGrn, Math.min(1, (f - 0.6) / 0.3));
  return out;
}

function fmtDmg(v){
  v = Math.round(v);
  if(v >= 10000) return Math.round(v / 1000) + "k";
  if(v >= 1000) return (v / 1000).toFixed(1) + "k";
  return "" + v;
}

function hpNew(e, isUnit, hp, mx, key){
  var f = Mathf.clamp(hp / mx);
  var s = {e: e, u: isUnit, k: key, last: hp, shown: f, ghost: f, ad: 0, ah: 0,
           tn: -999, tnh: -999, th: -999, vis: 0, flash: 0, mx: mx};
  (isUnit ? HP_U : HP_B)[key] = s;
  hpList.push(s);
  return s;
}

function hpDrop(i, s){
  hpList[i] = hpList[hpList.length - 1];
  hpList.pop();
  delete (s.u ? HP_U : HP_B)[s.k];
}

function hpBuildOk(b){
  var bl = b.block;
  if(bl.destructible === false) return false;
  if(bl instanceof ConstructBlockClass) return false;
  return true;
}

// Нашли ли сущность впервые раненой?
function hpDiscover(e, isUnit){
  var id = e.id;
  var map = isUnit ? HP_U : HP_B;
  if(map[id] !== undefined) return;
  var mx = mxOf(e);
  if(!(mx > 0)) return;
  var hp = hpOf(e);
  var full = isUnit ? hpFullU : hpFullB;
  if(hp >= mx - 0.01){ full.add(id); return; }
  if(!hpPrimed || !full.contains(id)){
    hpNew(e, isUnit, hp, mx, id);        // раненой уже застали: тихо, без цифры
  }else{
    hpNew(e, isUnit, mx, mx, id);        // была целой: покажем цифру и анимацию потери
  }
}

function hpDiscoverAll(){
  var nu = Groups.unit.size();
  for(var i = 0; i < nu; i++){
    var u = Groups.unit.index(i);
    if(u != null) hpDiscover(u, true);
  }
  var nb = Groups.build.size();
  var st = hpPrimed ? HP_STRIDE : 1;
  for(var j = hpPrimed ? (hpScan % st) : 0; j < nb; j += st){
    var b = Groups.build.index(j);
    if(b == null || !hpBuildOk(b)) continue;
    if(hpScan % 60 == 0 && j < st) diag.hpSample = String(b.block.name) + " " + Math.round(hpOf(b)) + "/" + Math.round(mxOf(b));
    hpDiscover(b, false);
  }
  hpScan++;
  hpPrimed = true;
}

function dmgSpawn(s, amt, heal){
  var q = qLevel();
  var cap = q >= 2 ? 90 : (q == 1 ? 50 : 24);
  while(dmgNums.length >= cap) dmgNums.shift();
  var e = s.e;
  var rel = Mathf.clamp(amt / Math.max(1, s.mx * 0.25));
  if(heal){
    dmgCol.set(hpGrn).lerp(Color.white, 0.25);
  }else if(e.team.id == Vars.player.team().id){
    dmgCol.set(hpOra).lerp(hpRed, rel);                 // урон по своим: оранжевый -> красный
  }else{
    dmgCol.set(Color.white).lerp(cGold, Mathf.clamp(rel * 2)).lerp(cOrange, Mathf.clamp(rel * 1.2 - 0.3));
  }
  diag.hpNums++;
  dmgNums.push({
    x: e.x + Mathf.range(7),
    y: e.y + (s.u ? e.hitSize * 0.5 : e.block.size * 4) + 4,
    vx: Mathf.range(0.25), vy: 0.55 + Mathf.random(0.2),
    t: 0, life: 52 + Mathf.random(14),
    txt: (heal ? "+" : "") + fmtDmg(amt),
    r: dmgCol.r, g: dmgCol.g, b: dmgCol.b,
    sz: heal ? 0.85 : 0.85 + rel * 0.9
  });
}

// Накопленный урон превращается в одну цифру раз в несколько тиков
function hpFlush(s, now, iv, showNum, force, cb){
  if(!showNum){ s.ad = 0; s.ah = 0; return; }
  var vis = cb.contains(s.e.x, s.e.y);
  if(s.ad >= 1 && (force || now - s.tn >= iv)){
    if(vis) dmgSpawn(s, s.ad, false);
    s.ad = 0; s.tn = now;
  }
  if(s.ah >= Math.max(3, s.mx * 0.01) && (force || now - s.tnh >= 40)){
    if(vis) dmgSpawn(s, s.ah, true);
    s.ah = 0; s.tnh = now;
  }
}

function hpStep(){
  var now = Time.time, dt = Time.delta;
  var cb = camBounds();
  var iv = 9 + Math.min(24, hpList.length * 0.25);
  var showNum = pref("vo-dmgnums", true);
  var i = 0;
  while(i < hpList.length){
    var s = hpList[i], e = s.e;
    if(!e.isValid()){
      hpFlush(s, now, iv, showNum, true, cb);
      hpDrop(i, s);
      continue;
    }
    var hp = hpOf(e), mx = mxOf(e);
    if(!(mx > 0)){ hpDrop(i, s); continue; }
    s.mx = mx;
    var d = s.last - hp;
    if(d > 0.01){ s.ad += d; s.th = now; s.flash = 1; }
    else if(d < -0.01){ s.ah -= d; }
    s.last = hp;
    hpFlush(s, now, iv, showNum, false, cb);

    // плавное изменение: полоска догоняет здоровье, «призрак» потери тает с задержкой
    var tf = Mathf.clamp(hp / mx);
    s.shown = Mathf.lerpDelta(s.shown, tf, 0.22);
    if(Math.abs(s.shown - tf) < 0.0005) s.shown = tf;
    if(now - s.th > 28) s.ghost = Mathf.lerpDelta(s.ghost, s.shown, 0.07);
    if(s.ghost < s.shown) s.ghost = s.shown;
    s.flash = Math.max(0, s.flash - 0.08 * dt);

    var want = (tf < 0.999 || s.ghost - s.shown > 0.004 || now - s.th < 150) ? 1 : 0;
    s.vis = Mathf.lerpDelta(s.vis, want, want == 1 ? 0.35 : 0.12);
    if(want == 0 && s.vis < 0.02){
      (s.u ? hpFullU : hpFullB).add(s.k);
      hpDrop(i, s);
      continue;
    }
    i++;
  }
}

function dmgStep(){
  var dt = Time.delta;
  var i = 0;
  while(i < dmgNums.length){
    var n = dmgNums[i];
    n.t += dt;
    if(n.t >= n.life){ dmgNums.splice(i, 1); continue; }
    n.x += n.vx * dt;
    n.y += n.vy * dt;
    n.vy *= (1 - 0.018 * dt);
    i++;
  }
}

function hpUpdate(){
  var bars = pref("vo-hpbars", true), nums = pref("vo-dmgnums", true);
  if(!bars && !nums){
    if(hpList.length > 0) hpReset();
    return;
  }
  hpDiscoverAll();
  hpStep();
  diag.hpTr = hpList.length;
  if(nums) dmgStep(); else dmgNums = [];
}

function hpReset(){
  HP_U = {}; HP_B = {}; hpList = [];
  hpFullU.clear(); hpFullB.clear();
  hpPrimed = false; hpScan = 0;
  dmgNums = [];
}

/* ---------- отрисовка полосок ---------- */

function drawBar(cx, cy, w, h, s, e, t){
  var a = s.vis;
  var x0 = cx - w / 2;
  Draw.color(0, 0, 0, 0.6 * a);
  Fill.rect(cx, cy, w + 1.6, h + 1.6);
  Draw.color(0.12, 0.13, 0.16, 0.9 * a);
  Fill.rect(cx, cy, w, h);
  if(s.ghost > s.shown + 0.002){
    Draw.color(1, 0.93, 0.7, 0.9 * a);
    Fill.rect(x0 + w * s.ghost / 2, cy, w * s.ghost, h);
  }
  if(s.shown > 0.001){
    hpColor(s.shown, hpTmp).lerp(Color.white, s.flash * 0.6);
    Draw.color(hpTmp, a);
    Fill.rect(x0 + w * s.shown / 2, cy, w * s.shown, h);
    Draw.color(1, 1, 1, 0.25 * a);
    Fill.rect(x0 + w * s.shown / 2, cy + h * 0.25, w * s.shown, h * 0.5);
  }
  if(w >= 22){
    Draw.color(0, 0, 0, 0.45 * a);
    for(var k = 1; k <= 3; k++) Fill.rect(x0 + w * k / 4, cy, 0.5, h);
  }
  if(s.shown < 0.25){
    var p = 0.5 + 0.5 * Math.sin(t * 0.3);
    Draw.color(hpRed, (0.35 + 0.5 * p) * a);
    Lines.stroke(0.7);
    Lines.rect(x0 - 0.9, cy - h / 2 - 0.9, w + 1.8, h + 1.8);
  }
  if(s.u){
    var sh = e.shield;
    if(sh > 0.5){
      var sf = Mathf.clamp(sh / s.mx);
      Draw.color(0.5, 0.9, 1, 0.9 * a);
      Fill.rect(x0 + w * sf / 2, cy + h / 2 + 1.4, w * sf, 1.2);
    }
  }
}

function drawHpBars(){
  if(hpList.length == 0) return;
  var cb = camBounds();
  var z0 = Draw.z();
  Draw.z(Z_BARS);
  var t = Time.time;
  for(var i = 0; i < hpList.length; i++){
    var s = hpList[i], e = s.e;
    if(s.vis < 0.03 || !e.isValid()) continue;
    var w, cy;
    if(s.u){
      w = Mathf.clamp(e.hitSize * 1.15, 14, 46);
      cy = e.y + e.hitSize * 0.5 + 5;
    }else{
      var sz = e.block.size;
      w = Math.max(9, sz * 8 * 0.92);
      cy = e.y + sz * 4 + 3.5;
    }
    if(!cb.overlaps(e.x - w / 2, cy - 4, w, 8)) continue;
    drawBar(e.x, cy, w, 2.4, s, e, t);
  }
  Draw.reset();
  Draw.z(z0);
}

/* ---------- отрисовка цифр урона ---------- */

function drawDmgNums(){
  if(dmgNums.length == 0) return;
  var f = FontsC.outline;
  var ints = f.usesIntegerPositions();
  f.setUseIntegerPositions(false);
  var z0 = Draw.z();
  Draw.z(Z_TXT);
  var base = 0.25 / SclC.scl(1);
  for(var i = 0; i < dmgNums.length; i++){
    var n = dmgNums[i];
    var k = n.t / n.life;
    var pop = 1 + 0.6 * Math.max(0, 1 - n.t / 7);
    var a = k > 0.6 ? 1 - (k - 0.6) / 0.4 : 1;
    f.getData().setScale(base * n.sz * pop);
    dmgDraw.set(n.r, n.g, n.b, a);
    f.setColor(dmgDraw);
    f.draw(n.txt, n.x, n.y, 0, AlignC.center, false);
  }
  f.getData().setScale(1);
  f.setColor(Color.white);
  f.setUseIntegerPositions(ints);
  Draw.reset();
  Draw.z(z0);
}

/* ---------- электричество: импульсы бегут по лучам линий передач ---------- */

var powerNodes = [];
var convList = [];
var fxTick = 0, convChecked = false;

function refreshFxLists(){
  var pn = [], cv = [];
  Groups.build.each(function(b){
    var bl = b.block;
    if(bl instanceof PowerNodeClass) pn.push(b);
    else if(bl instanceof ConveyorClass) cv.push(b);
  });
  powerNodes = pn;
  convList = cv;
}

// +1: импульсы идут от узла к другой стороне, -1: наоборот (от генератора к потребителю)
function pFlow(a, o){
  var ba = a.block, bo = o.block;
  var aProd = ba.outputsPower && !ba.consumesPower, oProd = bo.outputsPower && !bo.consumesPower;
  var aCons = ba.consumesPower && !ba.outputsPower, oCons = bo.consumesPower && !bo.outputsPower;
  if(oProd && !aProd) return -1;
  if(aProd && !oProd) return 1;
  if(oCons && !aCons) return 1;
  if(aCons && !oCons) return -1;
  return 1;
}

function drawPower(){
  if(powerNodes.length == 0) return;
  var lop = Core.settings.getInt("lasersopacity", 100) / 100;   // как у стандартных лучей
  if(lop <= 0.01) return;
  var q = qLevel(), t = Time.time;
  var cb = camBounds();
  var z0 = Draw.z();
  Draw.z(Z_POWER);
  Draw.blend(BlendC.additive);
  var half = Vars.tilesize / 2;
  for(var i = 0; i < powerNodes.length; i++){
    var b = powerNodes[i];
    if(b == null || !b.isValid() || b.power == null) continue;
    var links = b.power.links;
    var sat = Mathf.clamp(b.power.status);
    if(sat < 0.02) continue;                  // сеть без энергии: импульсов нет
    for(var li = 0; li < links.size; li++){
      var o = Vars.world.build(links.get(li));
      if(o == null || !o.isValid() || o.team != b.team) continue;
      if(o.block instanceof PowerNodeClass && o.id < b.id) continue;   // пару рисуем один раз
      var ang = Angles.angle(b.x, b.y, o.x, o.y);
      var vx = Mathf.cosDeg(ang), vy = Mathf.sinDeg(ang);
      var l1 = b.block.size * half - 1.5, l2 = o.block.size * half - 1.5;
      var sx = b.x + vx * l1, sy = b.y + vy * l1;
      var ex = o.x - vx * l2, ey = o.y - vy * l2;
      var L = Mathf.dst(sx, sy, ex, ey);
      if(L < 4) continue;
      if(!cb.overlaps(Math.min(sx, ex) - 8, Math.min(sy, ey) - 8, Math.abs(ex - sx) + 16, Math.abs(ey - sy) + 16)) continue;

      pwCol.set(cOrange).lerp(cCyan, Mathf.clamp(sat * 1.4));      // мало энергии - теплее
      pwCore.set(Color.white).lerp(pwCol, 0.35);
      var dir = pFlow(b, o);
      var ph = ((b.id * 31 + o.id * 17) % 100) / 100;
      var spd = 0.7 + 1.5 * sat;
      var cnt = Math.min(8, Math.max(1, Math.floor(L / (q >= 2 ? 30 : 48))));
      var tl = 9;

      if(q >= 1){                                              // слабое свечение вдоль луча
        Draw.color(pwCol, 0.09 * sat * lop);
        Lines.stroke(3);
        Lines.line(sx, sy, ex, ey);
      }
      for(var k = 0; k < cnt; k++){
        var u = wrap01(t * spd / L + k / cnt + ph);
        if(dir < 0) u = 1 - u;
        var fade = Math.min(1, Math.sin(Math.PI * u) * 2.2);
        var flick = sat < 0.3 ? (0.55 + 0.45 * Math.sin(t * 0.6 + k * 2 + ph * 20)) : 1;
        var al = fade * flick * lop;
        if(al <= 0.02) continue;
        var px = sx + (ex - sx) * u, py = sy + (ey - sy) * u;
        var ut = Mathf.clamp(u - dir * tl / L);
        var tx = sx + (ex - sx) * ut, ty = sy + (ey - sy) * ut;
        Draw.color(pwCol, 0.35 * al);
        Lines.stroke(2.2);
        Lines.line(tx, ty, px, py);
        Draw.color(pwCore, 0.8 * al);
        Lines.stroke(1.1);
        Lines.line(tx, ty, px, py);
        Draw.color(pwCol, 0.22 * al);
        Fill.circle(px, py, 4);
        Draw.color(pwCore, 0.95 * al);
        Fill.circle(px, py, 1.3 + sat * 0.5);
        if(q >= 2) Drawf.light(px, py, 14, pwCol, 0.3 * al);
      }
    }
  }
  Draw.blend();
  Draw.reset();
  Draw.z(z0);
}

/* ---------- конвейеры: искры вылетают на поворотах ленты ---------- */

var cornerList = [], cornerVis = [];

// Горячие искры: белые у основания, к концу оранжевые, летят по биссектрисе поворота
var cornerFx = new Effect(26, 60, function(e){
  var ang = e.rotation;
  Draw.color(Color.white, cOrange, e.fin());
  Angles.randLenVectors(e.id, 4, 3 + e.finpow() * 13, ang, 38, function(x, y){
    Lines.stroke(e.fout() * 1.1 + 0.25);
    Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), e.fout() * 3 + 0.6);
  });
  Draw.color(cGold, e.fout());
  Angles.randLenVectors(e.id + 5, 2, 2 + e.finpow() * 9, ang, 55, function(x, y){
    Fill.circle(e.x + x, e.y + y, e.fout() * 0.7 + 0.1);
  });
  Drawf.light(e.x, e.y, 10 * e.fout(), cOrange, 0.4 * e.fout());
});

// Угол вылета искр, если конвейер - поворот (питается сбоку, а не сзади), иначе null
function cornerAng(b){
  var r = b.rotation;
  var back = b.nearby((r + 2) % 4);
  if(back != null && back.block instanceof ConveyorClass && back.rotation == r) return null;
  var sides = [(r + 1) % 4, (r + 3) % 4];
  for(var i = 0; i < 2; i++){
    var sd = sides[i];
    var n = b.nearby(sd);
    if(n != null && n.block instanceof ConveyorClass && n.rotation == (sd + 2) % 4){
      var ai = ((sd + 2) % 4) * 90, ao = r * 90;
      return Angles.angle(0, 0, Mathf.cosDeg(ai) + Mathf.cosDeg(ao), Mathf.sinDeg(ai) + Mathf.sinDeg(ao));
    }
  }
  return null;
}

function refreshCorners(){
  var out = [];
  for(var i = 0; i < convList.length; i++){
    var b = convList[i];
    if(!b.isValid()) continue;
    var a = cornerAng(b);
    if(a != null) out.push({b: b, a: a});
  }
  cornerList = out;
}

function refreshCornerVis(){
  var cb = camBounds();
  var x = cb.x - 32, y = cb.y - 32, w = cb.width + 64, h = cb.height + 64;
  var out = [];
  for(var i = 0; i < cornerList.length; i++){
    var c = cornerList[i];
    if(c.b.x > x && c.b.x < x + w && c.b.y > y && c.b.y < y + h) out.push(c);
  }
  cornerVis = out;
}

// Искры вылетают, когда предмет реально проходит через поворот; быстрые ленты искрят чаще
function emitCorners(){
  if(cornerVis.length == 0) return;
  var q = qLevel();
  var budget = q >= 2 ? 10 : (q == 1 ? 5 : 2);
  var qmv = qm();
  for(var i = 0; i < cornerVis.length; i++){
    var c = cornerVis[i], b = c.b;
    if(!b.isValid()) continue;
    var len = b.len;
    if(len === undefined){
      if(!convChecked){ convChecked = true; fail("конвейеры", "нет поля len у конвейера"); }
      return;
    }
    if(!(len > 0)) continue;
    var ys = b.ys, hit = false;
    for(var k = 0; k < len; k++){
      if(ys[k] > 0.35 && ys[k] < 0.8){ hit = true; break; }
    }
    if(!hit) continue;
    var ch = 0.09 * qmv * (0.5 + b.block.speed * 12) * Time.delta;
    if(Mathf.chance(ch)){
      cornerFx.at(b.x + Mathf.range(1.5), b.y + Mathf.range(1.5), c.a);
      if(--budget <= 0) break;
    }
  }
}

/* ---------- подключение ---------- */

Events.run(EventType.Trigger.update, function(){
  if(Vars.headless || !Vars.state.isGame() || Vars.state.isPaused()) return;
  fxTick++;
  guard("здоровье и урон", hpUpdate);
  var pw = pref("vo-powerfx", true), cv = pref("vo-convfx", true);
  if(pw || cv){
    if(fxTick % 30 == 1) guard("поиск линий и конвейеров", refreshFxLists);
    if(cv && fxTick % 30 == 2) guard("повороты конвейеров", refreshCorners);
    if(cv && fxTick % 8 == 1) guard("видимые конвейеры", refreshCornerVis);
    if(cv) guard("искры конвейеров", emitCorners);
  }
});

Events.run(EventType.Trigger.draw, function(){
  if(Vars.headless || !Vars.state.isGame()) return;
  if(pref("vo-powerfx", true)) guard("импульсы линий", drawPower);
  if(pref("vo-hpbars", true)) guard("полоски здоровья", drawHpBars);
  if(pref("vo-dmgnums", true)) guard("цифры урона", drawDmgNums);
});

Events.on(EventType.WorldLoadEvent, function(e){
  hpReset();
  powerNodes = [];
  convList = [];
  cornerList = [];
  cornerVis = [];
  fxTick = 0;
  convChecked = false;
});
