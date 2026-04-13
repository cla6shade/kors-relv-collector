# openapi_buoy

|  |  |  |
| --- | --- | --- |
| 오픈API 활용가이드 |  |  |

|  |
| --- |
| 오픈API 활용가이드 |
| 해양관측부이 최신 관측데이터 |
|  |

서비스 명세

해양관측부이 최신 관측데이터

서비스 개요

|  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 서비스정보 | 서비스ID | SV-AP-03-002 | | | | | |
| 서비스명(국문) | 해양관측부이 최신 관측데이터 조회 서비스 | | | | | |
| 서비스명(영문) | GetTWRecentApiService | | | | | |
| 서비스설명 | 해양관측부이에서 관측하는 최신 해양관측데이터(수온, 염분, 기온, 기압, 풍향, 풍속, 유향, 유속, 파고 등)를 제공하는 서비스 | | | | | |
| 서비스보안 | 서비스인증/권한 | [ ○ ] 서비스 Key [ ] 인증서 (GPKI)  [ ] Basic (ID/PW) [ ] 없음 | | | | [ ] WS-Security | |
| 메시지레벨암호화 | [ ] 전자서명 [ ] 암호화 [ O ] 없음 | | | |
| 전송레벨암호화 | [ ] SSL [ O ] 없음 | | | | | |
| 적용  기술  수준 | 인터페이스표준 | [ O ] REST (GET, POST, PUT, DELETE)  [ ] SOAP 1.2 (RPC-Encoded, Document Literal, Document Literal Wrapped)  [ ] RSS 1.0 [ ] RSS 2.0 [ ] Atom 1.0 [ ] 기타 | | | | | |
| 교환데이터표준 | [ O ] XML [ O ] JSON [ ] MIME [ ] MTOM | | | | | |
| 서비스URL | 개발환경 | https://apis.data.go.kr/1192136/twRecent/GetTWRecentApiService | | | | | |
| 운영환경 | https://apis.data.go.kr/1192136/twRecent/GetTWRecentApiService | | | | | |
| 서비스WADL | 개발환경 | N/A | | | | | |
| 운영환경 | N/A | | | | | |
| 서비스배포  정보 | 서비스버전 | 1.0 | | | | | |
| 유효일자 | 2025-12-12 | | 배포일자 | | | 2025-12-12 |
| 서비스이력 | 최초 배포 | | | | | |
| 메시지교환유형 | | [ O ] Request-Response [ ] Publish-Subscribe  [ ] Fire-and-Forgot [ ] Notification | | | | | |
| 메시지로깅수준 | | 성공 | [O] Header [ ] Body | 실패 | [O] Header [ ] Body | | |
| 사용제약사항(비고) | | N/A | | | | | |

해양관측부이 최신 관측데이터 코드 정보

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| 코드 구분 | 코드 | 코드명 | 코드 | 코드명 |
| 관측소 목록 | HB\_0001 | 한수원\_기장 | TW\_0086 | 부산항신항 |
| HB\_0002 | 한수원\_고리 | TW\_0087 | 부산항 |
| HB\_0003 | 한수원\_진하 | TW\_0088 | 감천항 |
| HB\_0007 | 한수원\_온양 | TW\_0089 | 경포대해수욕장 |
| HB\_0008 | 한수원\_덕천 | TW\_0090 | 송정해수욕장 |
| HB\_0009 | 한수원\_나곡 | TW\_0091 | 낙산해수욕장 |
| KG\_0021 | 제주남부 | TW\_0092 | 임랑해수욕장 |
| KG\_0024 | 대한해협 | TW\_0093 | 속초해수욕장 |
| KG\_0025 | 남해동부 | TW\_0094 | 망상해수욕장 |
| KG\_0028 | 제주해협 | TW\_0095 | 고래불해수욕장 |
| KG\_0101 | 울릉도북동 |  |  |
| KG\_0102 | 울릉도북서 |  |  |
| TW\_0062 | 해운대해수욕장 |  |  |
| TW\_0069 | 대천해수욕장 |  |  |
| TW\_0070 | 평택당진항 |  |  |
| TW\_0072 | 군산항 |  |  |
| TW\_0074 | 광양항 |  |  |
| TW\_0075 | 중문해수욕장 |  |  |
| TW\_0076 | 인천항 |  |  |
| TW\_0077 | 경인항 |  |  |
| TW\_0078 | 완도항 |  |  |
| TW\_0079 | 상왕등도 |  |  |
| TW\_0080 | 우이도 |  |  |
| TW\_0081 | 생일도 |  |  |
| TW\_0082 | 태안항 |  |  |
| TW\_0083 | 여수항 |  |  |
| TW\_0084 | 통영항 |  |  |
| TW\_0085 | 마산항 |  |  |

해양관측부이 최신 관측데이터 오퍼레이션 명세

|  |  |  |  |
| --- | --- | --- | --- |
| 오퍼레이션유형 | 조회 | 오퍼레이션명(국문) | 해양관측부이 최신 관측데이터 조회 API |
| 오퍼레이션명(영문) | getTWRecentApi |
| 오퍼레이션설명 | 해양관측부이에서 관측하는 최신 해양관측데이터(수온, 염분, 기온, 기압, 풍향, 풍속, 유향, 유속, 파고 등)를 제공하는 기능 | | |
| Call Back URL | N/A | | |
| 최대메시지사이즈 | - | | |
| 평균응답시간 | - | 초당최대트랜잭션 | - |
| 테이블명 | API\_BUOY\_OBSRVN\_INFO | 엔티티명 | API부이 관측 정보 |

□ 해양관측부이 최신 관측데이터 오퍼레이션 요청 메시지 명세

※ 항목 구분 : 필수(1), 옵션(0), 1건 이상 복수건(1..n), 0건 또는 복수건(0..n)

| 항목명(영문) | 항목명(국문) | 항목크기 | 항목구분 | 샘플데이터 | 항목설명 |
| serviceKey | 서비스키 | varchar(200) | 1 | 인증키  (URL Encode) | 공공데이터포털 발급 인증키 |
| numOfRows | 한 페이지 결과 수 | number | 0 | 10 | 한 페이지 결과 수  기본값: 10 최댓값: 300 |
| pageNo | 페이지 번호 | number | 0 | 1 | 페이지 번호  기본값: 1 |
| type | 데이터 타입 | varchar(10) | 0 | xml | 응답 데이터 타입  기본값: xml  json 또는 xml |
| obsCode | 관측소 코드 | varchar(20) | 1 | TW\_0089 | 관측소 코드 |
| reqDate | 요청일자 | varchar(20) | 0 | 20250809 | 요청일자  기본값:현재일자 |
| min | 시간 간격 | numeric | 0 | 60 | 출력되는 시간 간격  기본값: 1  최댓값: 60 |
| include | 출력 항목 코드 | varchar(300) | 0 | lot, lat | 출력하고자 하는 항목명 |
| exclude | 출력 제외 항목 코드 | varchar(300) | 0 | lot, lat | 출력 제외하고자 하는 항목명 |

□ 해양관측부이 최신 관측데이터 오퍼레이션 응답 메시지 명세

※ 항목 구분 : 필수(1), 옵션(0), 1건 이상 복수건(1..n), 0건 또는 복수건(0..n)

| 항목명(영문) | | 항목명(국문) | 항목크기 | 항목구분 | 샘플데이터 | 항목설명 |
| resultCode | | 응답 메시지 코드 | varchar(2) | 1 | 0 | 응답 메시지 코드 |
| resultMsg | | 응답 메시지 내용 | varchar(50) | 1 | NORMAL SERVICE | 응답 메시지 내용 |
| totalCount | | 전체 응답 결과 수 | number | 1 | 1000 | 전체 응답 결과 수 |
| numOfRows | | 한 페이지 결과 수 | number | 1 | 10 | 한 페이지 결과 수 |
| pageNo | | 페이지 번호 | number | 1 | 1 | 페이지 번호 |
| type | | 응답 데이터 타입 | varchar(10) | 1 | json | 응답 데이터 타입 |
| items | | 목록 | number | 0..n | - | 정보 목록 |
|  | obsvtrNm | 관측소명 | varchar(200) | 0 | 경포대해수욕장 | 관측소명 |
| lot | 관측소 경도 | numeric | 0 | 128.931889 | 관측소 경도 |
| lat | 관측소 위도 | numeric | 0 | 37.808972 | 관측소 위도 |
| obsrvnDt | 관측일시 | timestamp | 0 | 2025-07-30 14:35 | 관측일시 |
| wndrct | 풍향 | numeric | 0 | 77.84 | 풍향(deg) |
| wspd | 풍속 | numeric | 0 | 3.7 | 풍속(m/s) |
| maxMmntWspd | 최대풍속 | numeric | 0 | 4.1 | 최대풍속(m/s) |
| artmp | 기온 | numeric | 0 | 28.4 | 기온(℃) |
| atmpr | 기압 | numeric | 0 | 1002.1 | 기압(hPa) |
| wvhgt | 파고 | numeric | 0 | 0.3 | 파고(m) |
| wvpd | 파주기 | numeric | 0 | 3.2 | 파주기(sec) |
| crdir | 유향 | numeric | 0 | 276.04 | 유향(deg) |
| crsp | 유속 | numeric | 0 | 10.30 | 유속(cm/s) |
| wtem | 수온 | numeric | 0 | 25.55 | 수온(℃) |
| slnty | 염분 | numeric | 0 | 31.40 | 염분(psu) |
|  |  |  |  |  |  |

□ 요청/응답 메세지 예제

|  |
| --- |
| REST(URL) |
| https://apis.data.go.kr/1192136/twRecent/GetTWRecentApiService?obsCode=TW\_0089&reqDate=20240809&min=60&serviceKey=AMyfd1QSZjfF9P6lRuzR40IrD25Ol7kqGpKRnf6CBRU |
| 응답 메시지 |
| <response>  <header>  <resultCode>00</resultCode>  <resultMsg>NORMAL\_SERVICE</resultMsg>  </header>  <body>  <items>  <item>  <obsvtrNm>경포대해수욕장</obsvtrNm>  <lot>128.93188</lot>  <lat>37.80897</lat>  <obsrvnDt>2024-08-09 00:00</obsrvnDt>  <wndrct>252.00</wndrct>  <wspd>1.4</wspd>  <maxMmntWspd>1.8</maxMmntWspd>  <artmp>26.2</artmp>  <atmpr>1004.9</atmpr>  <wvhgt>0.2</wvhgt>  <wvpd>4.4</wvpd>  <crdir>145.00</crdir>  <crsp>19.40</crsp>  <wtem>26.01</wtem>  <slnty>33.49</slnty>  </item>  </items>  <pageNo>1</pageNo>  <numOfRows>10</numOfRows>  <totalCount>1</totalCount>  <type>xml</type>  </body>  </response> |

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
