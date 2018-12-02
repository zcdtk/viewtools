const fs = require('fs');
const path = require('path');
const gulp = require('gulp');

const babel = require('gulp-babel');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');

// 工作空间路径
let BaseSrc = 'D:/Lab/Lab_IB5SYS01/.metadata/.plugins/org.eclipse.wst.server.core/tmp0/wtpwebapps/IB5Sys01/vuedev/pages/';
const rootPath = 'src';

function getAllViewTools() {
    let allTxtFiles = [];
    fs.readdirSync(rootPath).filter((moduleFolder) => {
        return fs.statSync(path.join(rootPath, moduleFolder)).isDirectory();
    }).forEach((moduleFolder) => {
        // 模块文件夹路径 （相对）
        let moduleFolderPath = path.join(rootPath, moduleFolder);
        fs.readdirSync(moduleFolderPath).filter((viewFolder) => {
            return fs.statSync(path.join(moduleFolderPath, viewFolder)).isDirectory();
        }).forEach((viewFolder) => {
            // 视图文件夹路径 （相对）
            let viewFolderPath = path.join(moduleFolderPath, viewFolder);
            fs.readdirSync(viewFolderPath).forEach((file) => {
                if (fs.statSync(path.join(viewFolderPath, file)).isFile()) {
                    allTxtFiles.push(path.join(viewFolderPath, file));
                }
            });
        });
    });
    return allTxtFiles;
}

gulp.task('mergeJs', function () {
    var txts = getAllViewTools();
    txts.map((txt) => {
        try {
            let contant = fs.readFileSync(txt, 'UTF-8');

            let viewInfo = { viewname: '', suburl: '', refviews: [] };
            let contant_arr = JSON.parse(JSON.stringify(contant.replace(/\r?\n/g, '').split(';')));
            if (contant_arr.length !== 3) {
                return;
            }
            viewInfo.viewname = contant_arr[0];
            viewInfo.suburl = contant_arr[1];
            let refviews = JSON.parse(JSON.stringify(contant_arr[2].split(',')));
            refviews.forEach((refview) => {
                viewInfo.refviews.push(BaseSrc + refview);
            });

            if (Object.is(viewInfo.viewname, '') || Object.is(viewInfo.suburl, '') || !Array.isArray(viewInfo.refviews) || viewInfo.refviews.length === 0) {
                return;
            }

            viewInfo.suburl = BaseSrc + viewInfo.suburl;
            viewInfo.refviews.forEach((refview) => {
                refview = BaseSrc + refview;
            });
            return gulp.src(viewInfo.refviews)
                .pipe(babel({
                    presets: ['@babel/env']
                }))
                .pipe(concat(viewInfo.viewname + '-allrefview.js'))
                .pipe(gulp.dest(viewInfo.suburl))
                .pipe(uglify())
                .pipe(rename(viewInfo.viewname + '-allrefview.min.js'))
                .pipe(gulp.dest(viewInfo.suburl));
        } catch (error) {
            console.log(error);
        }
    });
});