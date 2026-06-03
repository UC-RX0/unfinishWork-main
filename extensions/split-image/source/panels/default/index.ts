import { mkdir, readFileSync, writeFile } from 'fs-extra';
import { join } from 'path';
/**
 * @zh 如果希望兼容 3.3 之前的版本可以使用下方的代码
 * @en You can add the code below if you want compatibility with versions prior to 3.3
 */
// Editor.Panel.define = Editor.Panel.define || function(options: any) { return options }
module.exports = Editor.Panel.define({
    listeners: {
        show() { console.log('show'); },
        hide() { console.log('hide'); },
    },
    template: readFileSync(join(__dirname, '../../../static/template/default/index.html'), 'utf-8'),
    style: readFileSync(join(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
    $: {
        sliceBtn: '#sliceBtn',
        plistBtn: '#plistBtn',
        previewImg: '#previewImg',
        canvas: '#canvas',
        row: '#row',
        column: '#column',
    },
    methods: {
        
    },
    ready() {
        let filePath = '';
        let fileName = '';
        let imgNativeWidth = 0;
        let imgNativeHeight = 0;
        let imgElement: HTMLImageElement;
        let canvas = this.$.canvas! as HTMLCanvasElement;
        let ctx = canvas.getContext('2d')!;
        let row = 1;
        let col = 1;

        // 获得按钮的方法
        this.$.sliceBtn!.onclick = (e) => {
            let row = parseInt((this.$.row! as HTMLInputElement).value);
            let col = parseInt((this.$.column! as HTMLInputElement).value);
            // 1. 获取previewImg中的图片
            let width = imgNativeWidth / col;
            let height = imgNativeHeight / row;

            let rootPath = join(filePath, fileName);
            // 创建目录
            mkdir(rootPath, { recursive: true }, (err) => {
                if (err) {
                    console.log(err);
                }
            });
            let totalCount = row * col;
            for (let i = 0; i < row; i++) {
                for (let j = 0; j < col; j++) {
                    // 2. 根据row和col切割图片
                    canvas.width = width;
                    canvas.height = height;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(imgElement!, j * width, i * height, width, height, 0, 0, width, height);
                    let src = canvas.toDataURL();
                    
                    let buffer = Buffer.from(src.split(',')[1], 'base64');
                    let savePath = join(rootPath, fileName + '_' + i + '_' + j + '.png');
                    writeFile(savePath, buffer, 'base64', err => {
                        if (err) {
                            console.log(err);
                        } else {
                            totalCount--;
                            if( totalCount === 0) {
                                console.log('success');
                            }
                        }
                    });
                }
            }
            drawImage();
        }

        this.$.plistBtn!.onclick = (e) => {
            let row = parseInt((this.$.row! as HTMLInputElement).value);
            let col = parseInt((this.$.column! as HTMLInputElement).value);
            // let previewImg = this.$.previewImg!;
            // 1. 获取previewImg中的图片
            // let imgElement = previewImg.querySelector('img');
            let plistFileLines = [];
            plistFileLines.push('<?xml version="1.0" encoding="UTF-8"?>');
            plistFileLines.push('<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">');
            plistFileLines.push('<plist version="1.0">');
            plistFileLines.push('    <dict>');
            plistFileLines.push('        <key>frames</key>');
            plistFileLines.push('        <dict>');
            let width = imgElement!.naturalWidth / col;
            let height = imgElement!.naturalHeight / row;
            for (let i = 0; i < row; i++) {
                for (let j = 0; j < col; j++) {
                    plistFileLines.push('            <key>' + fileName + '_' + i + '_' + j + '.png</key>');
                    plistFileLines.push('            <dict>');
                    plistFileLines.push('                <key>aliases</key>');
                    plistFileLines.push('                <array/>');
                    plistFileLines.push('                <key>spriteOffset</key>');
                    plistFileLines.push('                <string>{0,0}</string>');
                    plistFileLines.push('                <key>textureRotated</key>');
                    plistFileLines.push('                <false/>');
                    plistFileLines.push('                <key>spriteSize</key>');
                    plistFileLines.push('                <string>{' + width + ',' + height + '}</string>');
                    plistFileLines.push('                <key>spriteSourceSize</key>');
                    plistFileLines.push('                <string>{' + width + ',' + height + '}</string>');
                    plistFileLines.push('                <key>textureRect</key>');
                    plistFileLines.push('                <string>{{' + j * width + ',' + i * height + '},{' + width + ',' + height + '}}</string>');
                    plistFileLines.push('            </dict>');
                }
            }
            plistFileLines.push('        </dict>');
            plistFileLines.push('        <key>metadata</key>');
            plistFileLines.push('        <dict>');
            plistFileLines.push('            <key>format</key>');
            plistFileLines.push('            <integer>3</integer>');
            plistFileLines.push('            <key>realTextureFileName</key>');
            plistFileLines.push('            <string>' + fileName + '.png</string>');
            plistFileLines.push('            <key>size</key>');
            plistFileLines.push('            <string>{' + imgElement!.naturalWidth + ',' + imgElement!.naturalHeight + '}</string>');
            plistFileLines.push('            <key>smartupdate</key>');
            plistFileLines.push('            <string>$TexturePacker:SmartUpdate$</string>');
            plistFileLines.push('        </dict>');
            plistFileLines.push('    </dict>');
            plistFileLines.push('</plist>');

            let fileFullPath = join(filePath, fileName + '.plist');
            
            writeFile(fileFullPath, plistFileLines.join('\n'), (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('success');
                }
            });
        }

        let drawImage = () => {
            if(imgElement) {
                let previewImg = this.$.previewImg!;
                let previewWidth = previewImg.offsetWidth - 2;
                let previewHeight = previewImg.offsetHeight - 2;
                canvas.width = previewWidth;
                canvas.height = previewHeight;
                // 计算图片缩放比
                let imgRatio = imgNativeWidth / imgNativeHeight;
                let previewRatio = previewWidth / previewHeight;
                if (imgRatio > previewRatio) {
                    imgElement.width = previewWidth;
                    imgElement.height = previewWidth / imgRatio;
                } 
                else {
                    imgElement.height = previewHeight;
                    imgElement.width = imgElement.height * imgRatio;
                }
                let imgWidth = imgElement.width;
                let imgHeight = imgElement.height;

                let offsetX = (previewWidth - imgWidth) / 2;
                let offsetY = (previewHeight - imgHeight) / 2;
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 1;
                ctx.clearRect(0, 0, previewWidth, previewHeight);
                ctx.beginPath();
                
                ctx.drawImage(imgElement, offsetX, offsetY, imgWidth, imgHeight);

                
                for (let i = 0; i < row + 1; i++) {
                    ctx.moveTo(offsetX, offsetY + i * imgHeight / row);
                    ctx.lineTo(offsetX + imgWidth, offsetY + i * imgHeight / row);
                    ctx.stroke();
                }        
                for (let i = 0; i < col + 1; i++) {
                    ctx.moveTo(offsetX + i * imgWidth / col, offsetY + 0);
                    ctx.lineTo(offsetX + i * imgWidth / col, offsetY + imgHeight);
                    ctx.stroke();
                }
            }
        };

        if(this.$.previewImg){
            let previewImg = this.$.previewImg;
            previewImg.ondragenter = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
            };
            previewImg.ondragover = (e) => {
                e.preventDefault();
                e.stopPropagation();
            };
            previewImg.ondragleave = (e) => {
                
            };
            previewImg.ondrop = (e) => {
                e.preventDefault();
                e.stopPropagation();
                let file = e.dataTransfer!.files[0];
                let suffix = file.name.substring(file.name.lastIndexOf('.'));
                if (suffix !== '.jpg' && suffix !== '.png') {
                    alert('只支持jpg和png格式的图片');
                    return;
                }
                fileName = file.name.substring(0, file.name.lastIndexOf('.'));
                filePath = (file as any).path;
                filePath = filePath.substring(0, filePath.lastIndexOf('\\') + 1);
                console.log(filePath);
                
                var reader = new FileReader();
                reader.onload = function (event) {
                    let source = event!.target!.result;
                    // 对读取的图片进行缩放，不超过previewImg的宽高
                    imgElement = new Image();
                    imgElement.src = source as string;
                    imgElement.onload = function () {
                        imgNativeWidth = imgElement.width;
                        imgNativeHeight = imgElement.height;
                        drawImage();
                    }
                };
                reader.readAsDataURL(file);
            };
        }


        if(this.$.column) {
            let columnInput = this.$.column as HTMLInputElement;
            columnInput.addEventListener('input', (e) => {
                let columnStr = columnInput.value;
                let rowStr = (this.$.row as HTMLInputElement).value;
                row = parseInt(rowStr);
                col = parseInt(columnStr);
                drawImage();
            });
        }
        if(this.$.row) {
            let rowInput = this.$.row as HTMLInputElement;
            rowInput.addEventListener('input', (e) => {
                let columnStr = (this.$.column as HTMLInputElement).value;
                let rowStr = rowInput.value;
                row = parseInt(rowStr);
                col = parseInt(columnStr);
                drawImage();
            });
        }
        
        window.onresize = () => {
            let previewImg = this.$.previewImg!;
            let previewWidth = previewImg.offsetWidth - 2;
            let previewHeight = previewImg.offsetHeight - 2;
            canvas.width = previewWidth;
            canvas.height = previewHeight;
            drawImage();
        };
    },
    beforeClose() { },
    close() { }
});
