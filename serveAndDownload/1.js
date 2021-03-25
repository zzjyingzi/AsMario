const str = 'https://2ts.kaban.cc/common/maomi/mm_m3u8_online/gc_tSfCVGKq/hls/1/index'; // 001.ts
const fs = require('fs');
let xc = '';

for(let i = 0; i < 193; i++){
  let x = i;
  if(i < 10){
    x = '00'+ i;
  } else if(i< 100){
    x = '0'+ i;
  } else if(i <1000) {
    x = i
  }
  xc = xc + str + x + '.ts' + "\n";
}

fs.writeFile('./a2.txt', xc, function (error){
  if (error) {
    throw error;
  }
})
