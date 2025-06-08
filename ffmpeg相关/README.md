# ffmpeg

## 应用

### 视频和音频合并

``` ffmpeg -i video.mp4 -i audio.mp4 -c:v copy -c:a copy output.mp4 ```

### 视频转mp3

- 简单转换 
  
  -vn 不保留视频流, 使用默认参数

  ``` ffmpeg -i input.mp4 -vn output.mp3 ```

- 控制参数

  编码器 ``` -acodec libmp3lame ```

  质量(0-9) ``` -q:a 2 ``` 0 为最高

  比特率 ``` -b:a 192k ```

  音频采样率 ``` -ar 44100 ```

  声道数 ``` -ac 2 ``` 2 为立体声


``` ffmpeg -i input.mp4 -vn -acodec libmp3lame -q:a 0 output.mp3 ```

### 截取视频

-ss 开始时间

-t 持续时间

-to 结束时间

时间格式 HH:MM:SS 或 mm:ss

``` ffmpeg -i input.mp4 -ss 00:05:20 -to 00:13:14 -c copy output.mp4 ```
