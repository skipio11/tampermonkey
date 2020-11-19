# AWS 가이드 영문 툴팁 Appender
## 개요
AWS 한글가이드의 일부는 기계번역으로 되어있어, 정확한 이해를 위해 영문가이드를 비교하고 싶을때가 있는데 이를 위해 브라우저의 툴팁기능을 활용하여 영문가이드를 보여주는 Tampermonkey 스크립트입니다.

## 설치방법
1. Tampermonkey 설치
    - [Tampermonkey](https://www.tampermonkey.net/)
    - 브라우저의 익스텐션인 Tampermonkey설치가 필요합니다.
2. 스크립트 설치
    - [Script](https://raw.githubusercontent.com/skipio11/tampermonkey/master/aws-doc-eng-tooltip-appender/aws-doc-eng-tooltip-appender.user.js)
3. 확인
    - Ex) [S3 개발자안내서](https://docs.aws.amazon.com/ko_kr/AmazonS3/latest/dev/Welcome.html)
    - ![](./caputre-s3-01.png?raw=true)

## 동작방식
1. 브라우저의 확장 플러그인인 Tampermonkey를 기반으로 동작합니다.
2. AWS의 한글 가이드가 로딩되면 Tampermonkey에서 스크립트를 자동으로 실행합니다.
   - 아래의 URL패턴에 대하여 스크립트가 적용됩니다.
```
// @include      https://docs.aws.amazon.com/ko_kr/*/*/*Guide/*.html
// @include      https://docs.aws.amazon.com/ko_kr/*/*/*guide/*.html
// @include      https://docs.aws.amazon.com/ko_kr/*/*/dev/*.html
// @include      https://docs.aws.amazon.com/ko_kr/*/*/dg/*.html
// @include      https://docs.aws.amazon.com/ko_kr/*/*/ug/*.html
// @include      https://docs.aws.amazon.com/ko_kr/*/*/gsg/*.html
// @include      https://docs.aws.amazon.com/ko_kr/*/*/user/*.html
// @include      https://docs.aws.amazon.com/ko_kr/*/*/mgmt/*.html
// @include      https://docs.aws.amazon.com/ko_kr/*/*/ag/*.html
// @include      https://docs.aws.amazon.com/ko_kr/*/*/red-ug/*.html
// @include      https://docs.aws.amazon.com/ko_kr/*/*/mem-ug/*.html
```
3. 이때, 한글가이드에 해당하는 영문가이드를 숨겨진 iframe에 동적으로 로딩합니다.
4. 문서 로딩이 끝나면 한글가이드의 위치와 일치하는 영문가이드 내의 텍스트를 찾아 툴팁을 넣어줍니다.

## 주의사항
- 문서의 위치를 기반으로 찾아가는 방식이기 때문에, 간혹 영문가이드와 한글가이드의 구조가 조금씩 차이를 보이는 경우 로딩이 되지 않거나, 잘못된 툴팁이 로딩될 수 있습니다.
- 또한 한글가이드에 대응되는 영문가이드가 존재하지 않는 경우도 있는데, 이 경우에 툴팁은 로딩되지 않습니다.