xml version="1.0" encoding="utf-8"?

.Section-0 {
width: 210mm;
}
.Section-0 .HeaderPageFooter {
position: relative;
margin-top: 15mm;
margin-right: 20mm;
margin-bottom: 15mm;
margin-left: 20mm;
}
.Section-0 .Page {
padding-top: 15mm;
padding-bottom: 15mm;
}
.HeaderArea {
position: absolute;
left: 0;
top: 0;
width: 170mm;
height: 15mm;
}
.HeaderArea {
position: absolute;
left: 0;
top: 0;
width: 170mm;
height: 15mm;
}
.FooterArea {
position: absolute;
left: 0;
bottom: 0;
width: 170mm;
height: 15mm;
}

|  |  |  |
| --- | --- | --- |
| 오픈API 활용가이드 |  |  |

|  |
| --- |
| 오픈API 활용가이드 |
| 조위관측소 최신 관측데이터 |
|  |

서비스 명세

조위관측소 최신 관측데이터

서비스 개요

|  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 서비스정보 | 서비스ID | SV-AP-03-001 | | | | | |
| 서비스명(국문) | 조위관측소 최신 관측데이터 조회 서비스 | | | | | |
| 서비스명(영문) | GetDTRecentApiService | | | | | |
| 서비스설명 | 조위관측소, 해양과학기지 등에서 관측하는 최신 해양관측데이터(조위, 수온, 염분, 기온, 기압, 풍향, 풍속, 유향, 유속 등)를 제공하는 서비스 | | | | | |
| 서비스보안 | 서비스인증/권한 | [ ○ ] 서비스 Key [ ] 인증서 (GPKI)  [ ] Basic (ID/PW) [ ] 없음 | | | | [ ] WS-Security | |
| 메시지레벨암호화 | [ ] 전자서명 [ ] 암호화 [ O ] 없음 | | | |
| 전송레벨암호화 | [ ] SSL [ O ] 없음 | | | | | |
| 적용  기술  수준 | 인터페이스표준 | [ O ] REST (GET, POST, PUT, DELETE)  [ ] SOAP 1.2 (RPC-Encoded, Document Literal, Document Literal Wrapped)  [ ] RSS 1.0 [ ] RSS 2.0 [ ] Atom 1.0 [ ] 기타 | | | | | |
| 교환데이터표준 | [ O ] XML [ O ] JSON [ ] MIME [ ] MTOM | | | | | |
| 서비스URL | 개발환경 | https://apis.data.go.kr/1192136/dtRecent/GetDTRecentApiService | | | | | |
| 운영환경 | https://apis.data.go.kr/1192136/dtRecent/GetDTRecentApiService | | | | | |
| 서비스WADL | 개발환경 | N/A | | | | | |
| 운영환경 | N/A | | | | | |
| 서비스배포  정보 | 서비스버전 | 1.0 | | | | | |
| 유효일자 | 2025-12-12 | | 배포일자 | | | 2025-12-12 |
| 서비스이력 | 최초 배포 | | | | | |
| 메시지교환유형 | | [ O ] Request-Response [ ] Publish-Subscribe  [ ] Fire-and-Forgot [ ] Notification | | | | | |
| 메시지로깅수준 | | 성공 | [O] Header [ ] Body | 실패 | [O] Header [ ] Body | | |
| 사용제약사항(비고) | | N/A | | | | | |

조위관측소 최신 관측데이터 코드 정보

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| 코드 구분 | 코드 | 코드명 | 코드 | 코드명 |
| 관측소 목록 | DT\_0001 | 인천 | DT\_0035 | 흑산도 |
| DT\_0002 | 평택 | DT\_0037 | 어청도 |
| DT\_0003 | 영광 | DT\_0039 | 왕돌초 |
| DT\_0004 | 제주 | DT\_0042 | 교본초 |
| DT\_0005 | 부산 | DT\_0043 | 영흥도 |
| DT\_0006 | 묵호 | DT\_0044 | 영종대교 |
| DT\_0007 | 목포 | DT\_0049 | 광양 |
| DT\_0008 | 안산 | DT\_0050 | 태안 |
| DT\_0010 | 서귀포 | DT\_0051 | 서천마량 |
| DT\_0011 | 후포 | DT\_0052 | 인천송도 |
| DT\_0012 | 속초 | DT\_0056 | 부산항신항 |
| DT\_0013 | 울릉도 | DT\_0057 | 동해항 |
| DT\_0014 | 통영 | DT\_0061 | 삼천포 |
| DT\_0016 | 여수 | DT\_0062 | 마산 |
| DT\_0017 | 대산 | DT\_0063 | 가덕도 |
| DT\_0018 | 군산 | DT\_0065 | 덕적도 |
| DT\_0020 | 울산 | DT\_0066 | 향화도 |
| DT\_0021 | 추자도 | DT\_0067 | 안흥 |
| DT\_0022 | 성산포 | DT\_0068 | 위도 |
| DT\_0023 | 모슬포 | DT\_0091 | 포항 |
| DT\_0024 | 장항 | DT\_0092 | 여호항 |
| DT\_0025 | 보령 | DT\_0093 | 소무의도 |
| DT\_0026 | 고흥발포 | DT\_0094 | 서거차도 |
| DT\_0027 | 완도 | DT\_0902 | 포항시청\_냉천항만교(수위) |
| DT\_0028 | 진도 | IE\_0060 | 이어도 |
| DT\_0029 | 거제도 | IE\_0061 | 신안가거초 |
| DT\_0031 | 거문도 | IE\_0062 | 옹진소청초 |
| DT\_0032 | 강화대교 |  |  |

조위관측소 최신 관측데이터 오퍼레이션 명세

|  |  |  |  |
| --- | --- | --- | --- |
| 오퍼레이션유형 | 조회 | 오퍼레이션명(국문) | 조위관측소 최신 관측데이터 조회 API |
| 오퍼레이션명(영문) | getDTRecentApi |
| 오퍼레이션설명 | 조위관측소, 해양과학기지 등에서 관측하는 최신 해양관측데이터(조위, 수온, 염분, 기온, 기압, 풍향, 풍속, 유향, 유속 등)를 제공하는 기능 | | |
| Call Back URL | N/A | | |
| 최대메시지사이즈 | - | | |
| 평균응답시간 | - | 초당최대트랜잭션 | - |
| 테이블명 | API\_RTM\_TDLV\_OBSRVN | 엔티티명 | 조위 최신 관측 정보 |

□ 조위관측소 최신 관측데이터 오퍼레이션 요청 메시지 명세

※ 항목 구분 : 필수(1), 옵션(0), 1건 이상 복수건(1..n), 0건 또는 복수건(0..n)

| 항목명(영문) | 항목명(국문) | 항목크기 | 항목구분 | 샘플데이터 | 항목설명 |
| serviceKey | 서비스키 | varchar(200) | 1 | 인증키  (URL Encode) | 공공데이터포털 발급 인증키 |
| numOfRows | 한 페이지 결과 수 | number | 0 | 10 | 한 페이지 결과 수  기본값: 10 최댓값: 300 |
| pageNo | 페이지 번호 | number | 0 | 1 | 페이지 번호  기본값: 1 |
| type | 데이터 타입 | varchar(10) | 0 | xml | 응답 데이터 타입  기본값: xml  json 또는 xml |
| obsCode | 관측소 코드 | varchar(20) | 1 | DT\_0018 | 관측소 코드 |
| reqDate | 요청일자 | varchar(20) | 0 | 20250809 | 요청일자  기본값:현재일자 |
| min | 시간 간격 | numeric | 0 | 60 | 출력되는 시간 간격  기본값: 1  최댓값: 60 |
| include | 출력 항목 코드 | varchar(300) | 0 | lot, lat | 출력하고자 하는 항목명 |
| lot, lat | 출력 제외하고자 하는 항목명 |
| 0 |
| varchar(300) |
| 출력 제외 항목 코드 |
| exclude |

□ 조위관측소 최신 관측데이터 오퍼레이션 응답 메시지 명세

※ 항목 구분 : 필수(1), 옵션(0), 1건 이상 복수건(1..n), 0건 또는 복수건(0..n)

| 항목명(영문) | | 항목명(국문) | 항목크기 | 항목구분 | 샘플데이터 | 항목설명 |
| resultCode | | 응답 메시지 코드 | varchar(2) | 1 | 0 | 응답 메시지 코드 |
| resultMsg | | 응답 메시지 내용 | varchar(50) | 1 | NORMAL SERVICE | 응답 메시지 내용 |
| totalCount | | 전체 응답 결과 수 | number | 1 | 1000 | 전체 응답 결과 수 |
| numOfRows | | 한 페이지 결과 수 | number | 1 | 10 | 한 페이지 결과 수 |
| pageNo | | 페이지 번호 | number | 1 | 1 | 페이지 번호 |
| type | | 응답 데이터 타입 | varchar(10) | 1 | json | 응답 데이터 타입 |
| items | | 목록 | number | 0..n | - | 정보 목록 |
|  | obsvtrNm | 관측소명 | varchar(200) | 0 | 군산 | 관측소명 |
| lot | 관측소 경도 | numeric | 0 | 126.563056 | 관측소 경도 |
| lat | 관측소 위도 | numeric | 0 | 35.975556 | 관측소 위도 |
| obsrvnDt | 관측일시 | timestamp | 0 | 2025-07-30 14:34 | 관측일시 |
| wndrct | 풍향 | numeric | 0 | 344.00 | 풍향(deg) |
| wspd | 풍속 | numeric | 0 | 5.0 | 풍속(m/s) |
| maxMmntWspd | 최대순간풍속 | numeric | 0 | 5.0 | 최대순간풍속(m/s) |
| artmp | 기온 | numeric | 0 | 29.4 | 기온(℃) |
| atmpr | 기압 | numeric | 0 | 999.4 | 기압(hPa) |
| wtem | 수온 | numeric | 0 | 25.90 | 수온(℃) |
| bscTdlvHgt | 조위 | numeric | 0 | 233.00 | 조위(cm) |
| slntQty | 염분 | numeric | 0 | 27.90 | 염분(psu) |
| crdir | 유향 | numeric | 0 | 16 | 유향(deg) |
| crsp | 유속 | numeric | 0 | 46 | 유속(m/s) |
|  |  |  |  |  |  |

□ 요청/응답 메시지 예제

|  |
| --- |
| REST(URL) |
| https://apis.data.go.kr/1192136/dtRecent/GetDTRecentApiService?obsCode=DT\_0018&reqDate=20240809&min=60&serviceKey=AMyfd1QSZjfF9P6lRuzR40IrD25Ol7kqGpKRnf6CBRU |
| 응답 메시지 |
| <response>  <header>  <resultCode>00</resultCode>  <resultMsg>NORMAL\_SERVICE</resultMsg>  </header>  <body>  <items>  <item>  <obsvtrNm>군산</obsvtrNm>  <lot>126.563056</lot>  <lat>35.975556</lat>  <obsrvnDt>2024-08-09 00:00</obsrvnDt>  <wndrct>344.00</wndrct>  <wspd>5.0</wspd>  <maxMmntWspd>5.0</maxMmntWspd>  <artmp>29.4</artmp>  <atmpr>999.4</atmpr>  <wtem>25.90</wtem>  <bscTdlvHgt>233.00</bscTdlvHgt>  <slntQty>27.90</slntQty>  <crdir/>  <crsp/>  </item>  </items>  <pageNo>1</pageNo>  <numOfRows>10</numOfRows>  <totalCount>1</totalCount>  <type>xml</type>  </body>  </response> |

Open API 에러 코드 정리

|  |  |  |
| --- | --- | --- |
| 에러코드 | 에러메세지 | 설명 |
| 0 | NORMAL\_SERVICE | 정상 |
| 1 | APPLICATION\_ERROR | 어플리케이션 에러 |
| 2 | DB\_ERROR | 데이터베이스 에러 |
| 3 | NODATA\_ERROR | 데이터없음 에러 |
| 4 | HTTP\_ERROR | HTTP 에러 |
| 5 | SERVICETIMEOUT\_ERROR | 서비스 연결실패 에러 |
| 10 | INVALID\_REQUEST\_PARAMETER\_ERROR | 잘못된 요청 파라메터 에러 |
| 11 | NO\_MANDATORY\_REQUEST\_PARAMETERS\_ERROR | 필수요청 파라메터가 없음 |
| 12 | NO\_OPENAPI\_SERVICE\_ERROR | 해당 오픈API서비스가 없거나 폐기됨 |
| 20 | SERVICE\_ACCESS\_DENIED\_ERROR | 서비스 접근거부 |
| 21 | TEMPORARILY\_DISABLE\_THE\_SERVICEKEY\_ERROR | 일시적으로 사용할 수 없는 서비스키 |
| 22 | LIMITED\_NUMBER\_OF\_SERVICE\_REQUESTS\_EXCEEDS\_ERROR | 서비스 요청제한횟수 초과에러 |
| 30 | SERVICE\_KEY\_IS\_NOT\_REGISTERED\_ERROR | 등록되지 않은 서비스키 |
| 31 | DEADLINE\_HAS\_EXPIRED\_ERROR | 기한만료된 서비스키 |
| 32 | UNREGISTERED\_IP\_ERROR | 등록되지 않은 IP |
| 33 | UNSIGNED\_CALL\_ERROR | 서명되지 않은 호출 |
| 40 | OBSERVATION\_STATION\_TEMPORARILY\_UNAVAILABLE | 관측소 서비스 일시 중지 |
| 41 | OBSERVATION\_ITEM\_TEMPORARILY\_UNAVAILABLE | 관측 항목 서비스 일시 중지 |
| 99 | UNKNOWN\_ERROR | 기타에러 |

|  |  |  |
| --- | --- | --- |
|  |  |  |