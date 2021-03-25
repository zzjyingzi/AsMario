export interface build{
    position: number;
    width: number;
    height: number;
    imgSrc: string;
}


export class Building implements build{
    position: number;
    width: number;
    height: number;
    imgSrc: string;
    influenceArea(){
        const {position, width, height} = this;
      return [position - width/2, position + width/2, height]; // 此处有错
    }
}
