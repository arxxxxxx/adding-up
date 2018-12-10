'use strict';
// Node.jsモジュールを呼び出す
// FileSystem ファイルを扱うモジュール
const fs = require('fs');
// readline ファイルを１行ずつ読み込むモジュール
const readline = require('readline');

// popu-pref.csvファイルから、ファイル読み込みを行うStreamを生成
const rs = fs.ReadStream('./popu-pref.csv');
// readlineオブジェクトのinputとして設定し、rlオブジェクトを作成
const rl = readline.createInterface({'input':rs,'output':{}});
/*
    Node.jsでは、入出力が発生する処理をほとんどStreamという形で扱います。
    Streamとは、非同期で情報を取り扱うための概念で、情報自体ではなく情報の流れに注目します。
    Node.jsでStreamを扱う際は、Streamに対してイベントを監視し、イベントが発生した時に呼び出される関数を設定することによって、情報を利用します。
    このように、あらかじめイベンtが発生した時に実行される関数を設定しておいて、起こったイベントに応じて処理を行うことを
    イベント駆動型プログラミングと呼びます
*/

const map = new Map(); // key:都道府県 value:集計データのオブジェクト

// rlオブジェクトでlineというイベントが発生したらこの無名関数を呼べ
// lineイベントが発生したタイミングで、コンソールに引数lineStringの内容が出力される
// lineStringには読み込んだ１行の文字列が入っている
rl.on('line',(lineString) => {
    // lineStringで与えられた文字列をカンマで分割してそれをcolumnsという配列にする
    const columns = lineString.split(',');
    // 集計年
    const year = parseInt(columns[0]);
    // 都道府県
    const prefecture = columns[2];
    // 15~19歳の人口
    const popu = parseInt(columns[7]);
    if(year === 2010 || year === 2015){
        let value = map.get(prefecture);
        if(!value){
            value = {
                popu10:0,
                popu15:0,
                change:null // 変化率
            };
        }
        if(year === 2010){
            value.popu10 += popu;
        }
        if(year ===2015){
            value.popu15 += popu;
        }
        map.set(prefecture,value);
    }
});
// ストリームに情報を流し始める処理
rl.resume();

rl.on('close',() => {
    // 変化率の計算
    /*
        for-of構文
        MapやArrayの中身をofの前に与えられた変数に代入してforループと同じことができる
        配列に含まれる要素を使いたいだけで添字は不要な場合に便利
        また、Mapにfor-ofを使うと、キーと値で要素が２つある配列が、前に与えられた変数に代入される
        この例ではpair[0]がキーである都道府県名 pair[1]で値である集計オブジェクトが得られる
    */
    for(let pair of map){
        const value = pair[1];
        value.change = value.popu15 / value.popu10;
    }
    // Array.from()メソッドを用いれば配列に似た型のもの（ここではMap）を普通の配列に変換することができます。
    const rankingArray = Array.from(map).sort((pair1,pair2) => {
        return pair2[1].change - pair1[1].change;
    });
    // map関数は、Arrayの要素それぞれを、与えられた関数を適用した内容に変換すると言うものです。
    // この部分では「Mapのキーと値が要素になった配列を要素「pair」として受け取り、それを文字列に変換する」と言う処理を行なっています。
    const rankingStrings = rankingArray.map((pair) => {
        return pair[0] + ':' + pair[1].popu10 + '=>' + pair[1].popu15 + ' 変化率' + pair[1].change;
    });
    console.log(rankingStrings);
})