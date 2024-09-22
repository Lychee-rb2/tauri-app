import LocalFont from "next/font/local";

const smiley = LocalFont({
  src: [{
    path: './SmileySans-Oblique.woff2',
  }],
  variable: "--font-smiley"
})
const HanSans = LocalFont({
  src: [{
    path: './SourceHanSans-VF.ttf.woff2',
  }],
  variable: "--font-han-sans"
})

const jetBrains_Mono = LocalFont({
  src: [{
    path: './jetBrains/jetBrainsMono-Regular.woff2',
    style: "normal"
  }, {
    path: './jetBrains/jetBrainsMono-Italic.woff2',
    style: "italic"
  }],
  variable: "--font-jb-mono"
})
export {smiley, jetBrains_Mono, HanSans}
