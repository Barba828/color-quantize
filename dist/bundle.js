var r=function(o,t){return r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(r,o){r.__proto__=o}||function(r,o){for(var t in o)Object.prototype.hasOwnProperty.call(o,t)&&(r[t]=o[t])},r(o,t)};var o=function(o){function t(r){void 0===r&&(r=function(r,o){return Number(r)-Number(o)});var t=o.call(this)||this;return t.comparator=r,t._sorted=!1,t.sort=function(r){return t._sorted=!0,o.prototype.sort.call(t,r||t.comparator)},t.push=function(r){return t._sorted=!1,o.prototype.push.call(t,r)},t.pop=function(){return t._sorted||t.sort(),o.prototype.pop.call(t)},t.peek=function(r){return t._sorted||t.sort(),void 0===r&&(r=t.length-1),t[r]},t.size=function(){return t.length},t.debug=function(){return t._sorted||t.sort(),t},t}return function(o,t){if("function"!=typeof t&&null!==t)throw new TypeError("Class extends value "+String(t)+" is not a constructor or null");function n(){this.constructor=o}r(o,t),o.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}(t,o),t}(Array),t=function r(o,t,e,u,i,c,f){var a=this;this.r1=o,this.r2=t,this.g1=e,this.g2=u,this.b1=i,this.b2=c,this.histo=f,this._count=-1,this.volume=function(r){return a._volume&&!r||(a._volume=(a.r2-a.r1+1)*(a.g2-a.g1+1)*(a.b2-a.b1+1)),a._volume},this.count=function(r){return a._count>-1&&!r||(a._count=a.histo.reduce((function(r,o){return r+(o||0)}),0)),a._count},this.copy=function(){return new r(a.r1,a.r2,a.g1,a.g2,a.b1,a.b2,a.histo)},this.avg=function(r){if(a._avg&&r)return a._avg;var o,t,e,u,i,c=0,f=1<<n,v=0,p=0,l=0;for(t=a.r1;t<=a.r2;t++)for(e=a.g1;e<=a.g2;e++)for(u=a.b1;u<=a.b2;u++)i=s(t,e,u),c+=o=a.histo[i]||0,v+=o*(t+.5)*f,p+=o*(e+.5)*f,l+=o*(u+.5)*f;return a._avg=c?[~~(v/c),~~(p/c),~~(l/c)]:[~~(f*(a.r1+a.r2+1)/2),~~(f*(a.g1+a.g2+1)/2),~~(f*(a.b1+a.b2+1)/2)],a._avg},this.contains=function(r){var o=r.map((function(r){return r>>n})),t=o[0],e=o[1],u=o[2];return t>=a.r1&&t<=a.r2&&e>=a.g1&&e<=a.g2&&u>=a.b1&&u<=a.b2}},n=3,e=function(r,o){return r<o?-1:r>o?1:0},u=function(r,o){return r.reduce((function(t,n){return t+(o?o.call(r,n):n)}),0)},i=function(r,o){return Math.max.apply(null,o?r.map(o):r)},c=function(r){return r.reduce((function(r,o){return o?r+1:r}),0)},s=function(r,o,t){return(r<<10)+(o<<5)+t},f=function(r,o){if(!o.count())return[];if(1==o.count())return[o.copy()];var t,n,e,u,c=o.r2-o.r1+1,f=o.g2-o.g1+1,a=o.b2-o.b1+1,v=i([c,f,a]),p=[],l=0;if(v===c)for(t=o.r1;t<=o.r2;t++){for(u=0,n=o.g1;n<=o.g2;n++)for(e=o.b1;e<=o.b2;e++)u+=r[s(t,n,e)]||0;l+=u,p[t]=l}else if(v===f)for(t=o.g1;t<=o.g2;t++){for(u=0,n=o.r1;n<=o.r2;n++)for(e=o.b1;e<=o.b2;e++)u+=r[s(n,t,e)]||0;l+=u,p[t]=l}else for(t=o.b1;t<=o.b2;t++){for(u=0,n=o.r1;n<=o.r2;n++)for(e=o.g1;e<=o.g2;e++)u+=r[s(n,e,t)]||0;l+=u,p[t]=l}var h=function(r){for(var t,n,e,u,i,c=r+"1",s=r+"2",f=o[c];f<=o[s];){if(!(p[f]<l/2)){for(e=o.copy(),u=o.copy(),i=(t=f-o[c])<=(n=o[s]-f)?Math.min(o[s]-1,~~(f+n/2)):Math.max(o[c],~~(f-1-t/2));!p[i];)i++;return e[s]=i,u[c]=i+1,[e,u]}f++}return[]};return h(v===c?"r":v===f?"g":"b")},a=function(){var r=this;this.push=function(o){r.vboxes.push({vbox:o,color:o.avg()})},this.palette=function(){return r.vboxes.map((function(r){return r.color}))},this.size=function(){return r.vboxes.size()},this.map=function(o){for(var t=0;t<r.vboxes.size();t++)if(r.vboxes.peek(t).vbox.contains(o))return r.vboxes.peek(t).color;return r.nearest(o)},this.nearest=function(o){var t,n,e,u;for(t=0;t<r.vboxes.size();t++)((e=Math.sqrt(Math.pow(o[0]-r.vboxes.peek(t).color[0],2)+Math.pow(o[1]-r.vboxes.peek(t).color[1],2)+Math.pow(o[2]-r.vboxes.peek(t).color[2],2)))<n||void 0===n)&&(n=e,u=r.vboxes.peek(t).color);return u},this.forcebw=function(){r.vboxes.sort((function(r,o){return e(u(r.color),u(o.color))}));var o=r.vboxes[0].color;o[0]<5&&o[1]<5&&o[2]<5&&(r.vboxes[0].color=[0,0,0]);var t=r.vboxes.length-1,n=r.vboxes[t].color;n[0]>251&&n[1]>251&&n[2]>251&&(r.vboxes[t].color=[255,255,255])},this.vboxes=new o((function(r,o){return e(r.vbox.count()*r.vbox.volume(),o.vbox.count()*o.vbox.volume())}))};(new Date).getTime();var v=(new Date).getTime(),p=function(r,u){if(!r.length||u<2||u>256)return new a;var i=function(r){var o,t,e,u,i=new Array(32768);return r.forEach((function(r){var c;c=r.map((function(r){return r>>n})),t=c[0],e=c[1],u=c[2],o=s(t,e,u),i[o]=(i[o]||0)+1})),i}(r);c(i);var v=function(r,o){var e,u,i,c=1e6,s=0,f=1e6,a=0,v=1e6,p=0;return r.forEach((function(r){var o;o=r.map((function(r){return r>>n})),e=o[0],u=o[1],i=o[2],e<c?c=e:e>s&&(s=e),u<f?f=u:u>a&&(a=u),i<v?v=i:i>p&&(p=i)})),new t(c,s,f,a,v,p,o)}(r,i),p=new o((function(r,o){return e(r.count(),o.count())}));p.push(v);var l=function(r,o){for(var t,n=r.size(),e=0;e<1e3;){if(n>=o)return;if(e++>1e3)return;if(r.peek().count()){t=r.pop();var u=f(i,t),c=u[0],s=u[1];if(!c)return;r.push(c),s&&(r.push(s),n++)}else e++}};l(p,.75*u);for(var h=new o((function(r,o){return e(r.count()*r.volume(),o.count()*o.volume())}));p.size();)h.push(p.pop());l(h,u);for(var b=new a;h.size();)b.push(h.pop());return b}([[190,197,190],[202,204,200],[207,214,210],[211,214,211],[205,207,207]],4);console.log("lnz",p.palette());var l=(new Date).getTime();console.log("lnz time",l-v);
