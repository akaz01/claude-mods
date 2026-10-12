# Agent Board 0.7.0 — Codex와 같은 대시보드 UI

Anthropic/Claude 마크와 현재 모델·Git 브랜치·작은 5h/7d 잔량 바는 유지하고, Codex Terminal Monitor처럼 고정 헤더·가로 구분선·시안 모델명·작업 상태 색상·세 줄 에이전트 행·고정 고양이를 사용합니다. Home 순서는 메인 세션 → 서브 에이전트 → 백그라운드 작업 → 스킬 → MCP 서버입니다.

오른쪽 패널을 클릭하거나 Claude의 패널 포커스 단축키로 이동한 뒤 1~6 또는 탭 버튼을 사용합니다. Home / Agents / Log / MCP / Plug / Skills가 Codex와 같은 순서로 표시됩니다. 스크롤은 Claude의 화살표·Page Up/Down·마우스 휠을 사용합니다. `/agent-board`로 열고 닫습니다. 헤더와 고양이는 스크롤해도 고정되고, 긴 내용은 한 줄로 잘립니다. Codex 전용 tmux 단축키는 Claude에 적용하지 않습니다.

- Agents: 작업 중인 서브 에이전트만 표시하며 모델과 실제 관측 작업을 함께 보여줍니다.
- Log: 최근 도구 24개의 이름·소유 에이전트·완료/오류 상태. 도구 인수·대화·비공개 추론은 저장하지 않습니다.
- 스킬: 현재 세션에서 사용한 스킬과 호출 횟수. 실시간 실행 중 목록과 구분합니다.
- MCP: 도구 목록에 있는 서버와 현재 세션에서 관측한 호출 기록. 실행 상태를 추측하지 않습니다.
- Plug: 엔진이 알려준 현재 로드 그룹의 모드 이름입니다. 재로드 직후에는 재로드된 그룹만 표시될 수 있으며 전체 설치 목록을 의미하지 않습니다.

계정 공유 한도는 실제 제공된 5h/7d 값만 표시하며 잔량 바는 최대 12칸입니다. 모델·브랜치·한도는 시작 시, session.measure 이벤트, 약 15초마다 읽습니다. 이 조회와 고양이 애니메이션은 모델을 호출하지 않습니다.

고양이는 검정·옅은 크림색·흰색 삼색 무늬, 비대칭 얼굴과 연녹색 눈을 유지합니다. 휴식·관찰·작업·분주·확인 대기·오류·완료의 7가지 동작이며 각각 4프레임입니다. 높이 26줄 이상이면 하단 10줄을 고양이와 여백에 사용하고, 작은 창에서는 두 줄로 줄입니다.

Claude 하단 context는 함께 포함된 token-weather 0.2.0을 사용합니다. Codex와 같은 기준으로 초록 Go(<50%), 노랑 Caution(50~74%), 빨강 Stop(75~89%), 빨강 Compact soon(90% 이상)을 표시합니다. 누적 비용/토큰 총합이 아닌 현재 context 사용률입니다. 값이 없으면 0으로 만들지 않고, 갱신 실패 시 마지막 값에 STALE을 표시합니다.

## 설치와 갱신

`claude plugin install agent-board@my-mods` 또는 기존 설치는 `claude plugin update agent-board@my-mods`를 사용합니다. 최신 파일을 적용하려면 새 Claude Code 세션을 열거나, 작업이 끝난 현재 세션에서 `/reload-plugins`를 실행하세요.

개발 검증은 `claude plugin test .`와 `claude plugin validate .`입니다. 배포 ZIP에는 테스트 파일이 제외됩니다. Claude Code 2.1.296에서 검증했습니다. Mods API 참고: https://code.claude.com/docs/en/plugins/mods/reference

Anthropic과 Claude 명칭 및 마크는 Anthropic의 상표입니다. 사용자용 커스텀 테마입니다.
