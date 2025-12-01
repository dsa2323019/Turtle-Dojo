import { Level } from './types';

export const GAME_LEVELS: Level[] = [
  {
    id: 1,
    title: "はじめの一歩",
    description: "道場へようこそ！まずはカメを前に進めてみましょう。「前に進む」ボタンを押すか、`forward(100)` と入力して線を描いてください。",
    targetShapeName: "直線",
    initialCode: "# ここにコードが追加されます",
    solutionCode: "forward(100)",
    hints: ["`forward(距離)` を使うと進みます。", "距離は 100 くらいがちょうどいいです。"],
    checkSuccess: (state, length, turns) => length >= 100 && turns === 0
  },
  {
    id: 2,
    title: "曲がり角",
    description: "次は曲がる練習です。前に進んでから、90度右に回転し、もう一度前に進んで「L字」を描きましょう。",
    targetShapeName: "L字型",
    initialCode: "# ここにコードが追加されます\n",
    solutionCode: "forward(100)\nright(90)\nforward(100)",
    hints: ["`right(90)` で右に90度回ります。", "回った後にもう一度進むのを忘れずに。"],
    checkSuccess: (state, length, turns) => length >= 200 && turns === 90
  },
  {
    id: 3,
    title: "正方形の極意",
    description: "ループ（繰り返し）を使って正方形を描きます。4回同じ動きを繰り返すので `for` 文を使うと便利です。",
    targetShapeName: "正方形",
    initialCode: "# ループブロックを使ってみよう\nfor i in range(4):\n    pass",
    solutionCode: "for i in range(4):\n    forward(100)\n    right(90)",
    hints: ["正方形は4つの辺と4つの角があります。", "曲がる角度は90度です。", "ループの中に「進む」と「曲がる」を入れましょう。"],
    checkSuccess: (state, length, turns) => length >= 400 && turns >= 270 && Math.abs(state.x) < 5 && Math.abs(state.y) < 5
  },
  {
    id: 4,
    title: "トライアングル・パワー",
    description: "正三角形を描きましょう。三角形の外角は120度（360 ÷ 3）であることに注意してください。",
    targetShapeName: "正三角形",
    initialCode: "for i in range(3):\n    # ここに中身を書く",
    solutionCode: "for i in range(3):\n    forward(150)\n    left(120)",
    hints: ["曲がる角度は60度ではなく、120度です。", "3回繰り返すループを使います。"],
    checkSuccess: (state, length, turns) => length >= 300 && turns >= 240 && Math.abs(state.x) < 5 && Math.abs(state.y) < 5
  },
  {
    id: 5,
    title: "五角形のパトロール",
    description: "正五角形（5角形）を描きます。角度は「360 ÷ 5」で計算できます。",
    targetShapeName: "正五角形",
    initialCode: "# 360 / 5 = 72度\n",
    solutionCode: "for i in range(5):\n    forward(100)\n    right(72)",
    hints: ["360を5で割ると72になります。", "5回繰り返す必要があります。"],
    checkSuccess: (state, length, turns) => length >= 500 && turns >= 288 && Math.abs(state.x) < 5 && Math.abs(state.y) < 5
  }
];