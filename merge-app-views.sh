#!/bin/bash
for /r %%a in (*.sh) do (
    if /i "%%~xa"==".sh" (
        if /i not "%%~nxa"=="%~nx0" sh "" "%%~a"
    )
)

exit