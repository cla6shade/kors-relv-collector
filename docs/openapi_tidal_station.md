# openapi_tidal_station

|  |  |  |
| --- | --- | --- |
| 오픈API 활용가이드 |  |  |

|  |
| --- |
| 오픈API 활용가이드 |
| 조위관측소 실측·예측 조위 |
|  |

|  |  |  |
| --- | --- | --- |
|  |  |  |

|  |  |  |
| --- | --- | --- |
| 오픈API 활용가이드 |  |  |

서비스 명세

조위관측소 실측·예측 조위

서비스 개요

|  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 서비스정보 | 서비스ID | SV-AP-02-009 | | | | | |
| 서비스명(국문) | 조위관측소 실측·예측 조위 조회 서비스 | | | | | |
| 서비스명(영문) | GetSurveyTideLevelApiService | | | | | |
| 서비스설명 | 국립해양조사원에서 구축 및 운영 중인 국가해양관측망의 조위관측소에서 관측한 실시간 관측자료(실측·예측 조위) 정보 제공 서비스 | | | | | |
| 서비스보안 | 서비스인증/권한 | [ O ] 서비스 Key [ ] 인증서 (GPKI)  [ ] Basic (ID/PW) [ ] 없음 | | | [ ] WS-Security | | |
| 메시지레벨암호화 | [ ] 전자서명 [ ] 암호화 [ O ] 없음 | | |
| 전송레벨암호화 | [ ] SSL [ O ] 없음 | | | | | |
| 적용기술수준 | 인터페이스표준 | [ ] SOAP 1.2  (RPC-Encoded, Document Literal, Document Literal Wrapped)  [ O ] REST (GET, POST, PUT, DELETE)  [ ] RSS 1.0 [ ] RSS 2.0 [ ] Atom 1.0 [ ] 기타 | | | | | |
| 교환데이터표준 | [ O ] XML [ O ] JSON [ ] MIME [ ] MTOM | | | | | |
| 서비스URL | 개발환경 | https://apis.data.go.kr/1192136/surveyTideLevel/GetSurveyTideLevelApiService | | | | | |
| 운영환경 | https://apis.data.go.kr/1192136/surveyTideLevel/GetSurveyTideLevelApiService | | | | | |
| 서비스WADL | 개발환경 | N/A | | | | | |
| 운영환경 | N/A | | | | | |
| 서비스배포정보 | 서비스버전 | 1.0 | | | | | |
| 유효일자 | 2025-03-14 | | 배포일자 | | | 2025-03-14 |
| 서비스이력 | 최초 배포 | | | | | |
| 메시지교환유형 | | [ O ] Request-Response [ ] Publish-Subscribe  [ ] Fire-and-Forgot [ ] Notification | | | | | |
| 메시지로깅수준 | | 성공 | [O] Header [ ] Body | 실패 | | [O] Header [ ] Body | |
| 사용제약사항(비고) | | N/A | | | | | |

조위관측소 실측·예측 조위 코드정보

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

조위관측소 실측·예측 조위 오퍼레이션 명세

|  |  |  |  |
| --- | --- | --- | --- |
| 오퍼레이션유형 | 조회 | 오퍼레이션명(국문) | 조위관측소 실측·예측 조위 조회 API |
| 오퍼레이션명(영문) | getSurveyTideLevelApi |
| 오퍼레이션설명 | 국립해양조사원에서 구축 및 운영 중인 국가해양관측망의 조위관측소에서 관측한 실시간 관측자료(실측·예측 조위) 정보 제공 서비스 | | |
| Call Back URL | N/A | | |

□ 조위관측소 실측·예측 조위 오퍼레이션 요청 메시지 명세

|  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- |
| 항목명(영문) | 항목명(국문) | 항목크기 | 항목구분 | 샘플데이터 | 항목설명 |
| serviceKey | API 인증키 | varchar(200) | 1 | 인증키  (URL Encode) | 공공데이터포털  에서 발급받은  인증키 |
| type | 데이터 타입 | varchar(10) | 1 | json | json/xml 중 택 1 |
| obsCode | 관측소코드 | varchar(20) | 1 | DT\_0001 | 관측소코드 |
| reqDate | 조위관측일 | varchar(20) | 0 | 20241022 | 조위관측일  기본값: 현재일시 |
| min | 시간 간격 | number | 0 | 60 | 출력되는 시간 간격 기본값: 1 |
| pageNo | 페이지 번호 | number | 0 | 1 | 페이지 번호  기본값: 1 |
| numOfRows | 한 페이지 결과수 | number | 0 | 10 | 한 페이지당  데이터 갯수  기본값: 10,  최대값: 300 |
| include | 출력항목코드 | varchar(300) | 0 | lat,lot | 출력하고자 하는 항목명 |
| exclude | 출력제외항목코드 | varchar(300) | 0 | lat,lot | 출력 제외하고자하는 항목명 |

※ 항목구분 : 필수(1), 옵션(0), 1건 이상 복수건(1..n), 0건 또는 복수건(0..n)

□ 조위관측소 실측·예측 조위 오퍼레이션 응답 메시지 명세

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| 항목명(영문) | | 항목명(국문) | 항목크기 | 항목구분 | 샘플데이터 | 항목설명 |
| resultCode | | 응답 메시지 코드 | varchar(2) | 1 | 0 | 응답 메시지 코드 |
| resultMsg | | 응답 메시지 내용 | varchar(50) | 1 | NORMAL SERVICE | 응답 메시지 내용 |
| totalCount | | 응답 결과 수 | number | 1 | 1 | 응답 결과 수 |
| pageNo | | 페이지 번호 | number | 1 | 1 | 페이지 번호 |
| numOfRows | | 한 페이지 결과수 | number | 1 | 10 | 한 페이지당  데이터 갯수 |
| type | | 데이터 타입 | varchar(10) | 1 | json | 데이터 타입 |
| items | | 목록 | number | 0..n | - | 정보 목록 |
|  | obsvtrNm | 관측소 | varchar(100) | 0 | 인천 | 관측소 |
| lat | 위도 | numeric | 0 | 37.45194 | 위도 |
| lot | 경도 | numeric | 0 | 126.59222 | 경도 |
| obsrvnDt | 관측일시 | timestamp | 0 | 2024-10-22 05:51:00 | 관측일시 |
| bscTdlvHgt | 실측조위 | numeric | 0 | 40.0 | 실측조위(cm) |
| tdlvHgt | 예측조위 | numeric | 0 | 125.0 | 예측조위(cm) |

※ 항목구분 : 필수(1), 옵션(0), 1건 이상 복수건(1..n), 0건 또는 복수건(0..n)

□ 요청/응답 메시지 예제

|  |
| --- |
| REST(URL) |
| https://apis.data.go.kr/1192136/surveyTideLevel/GetSurveyTideLevelApiService?serviceKey=RT7WPPcXUqV5p\_\_FJah7Ci492QgGtLBkJFQZ4VVVfOo&type=json&obsCode=DT\_0001&reqDate=20250904&min=60&pageNo=1&numOfRows=10 |
| 응답 메시지 |
| {  "response": {  "header": {  "resultCode": "00",  "resultMsg": "NORMAL\_SERVICE"  },  "body": {  "items": {  "item": [  {  "obsvtrNm": "인천",  "lat": 37.45194,  "lot": 126.59222,  "obsrvnDt": "2025-09-04 03:00",  "bscTdlvHgt": 692,  "tdlvHgt": 668.6  }  ]  },  "pageNo": 1,  "numOfRows": 10,  "totalCount": 11,  "type": "json"  }  }  } |

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
