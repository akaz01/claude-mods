# 프롬프트로 직접 만들어 보기

이 저장소의 소스를 참고 자료로 삼아 agent-board, auto-model, session-collab과 같은 기능을 내 마켓플레이스에 직접 구현하는 단계별 프롬프트입니다.
그대로 복사하지 않고 구조를 이해하면서 내 방식대로 바꿔 만드는 것을 목표로 합니다.

요구 사항: Claude Code 2.1.295 이상, Mods 기능을 사용할 수 있는 계정, git.

난이도는 session-collab(스킬 하나) → auto-model(명령 + 훅) → agent-board(패널 UI) 순으로 올라갑니다. 이 순서대로 진행하는 것을 권장합니다.

## 0단계: 참고 소스와 작업 폴더 준비

빈 작업 폴더에서 Claude Code를 실행한 뒤 붙여넣으세요.

```
Claude Code mods를 직접 만들어 보려고 해. 아래를 준비해줘.
1. 참고용으로 https://github.com/akaz01/claude-mods 를 현재 폴더의 reference/claude-mods 에 `git clone --depth 1`로 받아줘.
   reference 폴더는 읽기만 하고 수정하지 마.
2. 내 플러그인을 만들 폴더 my-marketplace 를 만들고 git 저장소로 초기화해줘.
3. reference/claude-mods 의 폴더 구조를 트리로 보여주고, 각 파일이 어떤 역할인지 한 줄씩 설명해줘.
```

## 1단계: Mods 구조 이해

```
reference/claude-mods 를 읽고 Claude Code 플러그인과 mods 구조를 설명해줘. 아직 코드는 만들지 마.
1. .claude-plugin/marketplace.json 과 각 플러그인의 .claude-plugin/plugin.json 이 하는 일
2. hooks/hooks.json 의 "modules"가 register.ts(x)를 불러오는 방식
3. register 함수의 on('이벤트', handler) 패턴과 next(e)의 의미
4. atom / read / update 로 상태를 저장하는 방식
5. skills/<이름>/SKILL.md 형식의 스킬이 훅 기반 mod와 어떻게 다른지
공식 문서 https://code.claude.com/docs/en/plugins/mods/reference 와 비교해서, 소스에서 쓴 API 중 문서에 없는 것이 있으면 따로 표시해줘.
```

## 2단계: 내 마켓플레이스 뼈대 만들기

```
my-marketplace 에 내 마켓플레이스 뼈대를 만들어줘. reference 의 구조를 참고하되 이름과 설명은 내 것으로 바꿔줘.
- 마켓플레이스 이름: <내 마켓플레이스 이름>
- 소유자 이름: <내 이름>
- 플러그인은 plugins/<이름> 아래에 둘 거야. 지금은 marketplace.json의 plugins를 빈 배열로 둬.
만든 다음 `claude plugin validate my-marketplace`로 검증해줘.
```

## 3단계: 세션 협업 스킬 (session-collab 참고)

```
reference/claude-mods/plugins/session-collab 를 참고해서 my-marketplace/plugins/<내 협업 플러그인 이름> 을 만들어줘.
1. 먼저 SKILL.md의 프로토콜(메시지 첫 줄 형식, thread/turn 번호, TYPE 종류, 종료 조건)을 요약해서 보여줘.
2. 내 상황에 맞게 바꿀 점을 나한테 물어봐줘. 예: 메시지 머리말, TYPE 종류, 최대 턴 수.
3. 내가 답하면 plugin.json과 skills/<스킬 이름>/SKILL.md를 작성하고 marketplace.json에 등록해줘.
4. `claude plugin validate`로 검증해줘.
전달은 Claude Code 공식 도구인 ListAgents와 SendMessage만 쓰도록 해줘.
```

## 4단계: 자동 모델 선택 (auto-model 참고)

```
reference/claude-mods/plugins/auto-model 을 참고해서 my-marketplace/plugins/<내 플러그인 이름> 을 만들어줘.
1. 먼저 register.ts와 rules.ts가 하는 일을 설명해줘.
   - 명령 등록(session.start, command.run)
   - 사용자가 /model로 직접 고르면 자동 선택을 멈추는 부분(classic.PostModelSwitch)
   - 프롬프트 키워드로 작업 등급을 나누는 classify와 등급별 모델 매핑
2. 키워드 규칙과 등급별 모델(haiku / sonnet / opus 별칭)을 내 작업 방식에 맞게 정하도록 질문해줘.
3. 내가 답하면 hooks/hooks.json, hooks/register.ts, hooks/rules.ts, types/index.d.ts를 작성해줘.
   기본값은 꺼짐으로 하고, 세션마다 직접 켜야 동작하게 해줘.
4. rules.ts의 분류 함수는 순수 함수로 두고, 예시 프롬프트 몇 개로 어떤 등급이 나오는지 표로 보여줘.
5. `claude plugin validate`로 검증해줘.
```

## 5단계: 현황 대시보드 패널 (agent-board 참고)

가장 큰 단계라서 세 번에 나눠 진행합니다.

```
reference/claude-mods/plugins/agent-board 의 구조를 분석해줘. 아직 코드는 만들지 마.
- register.tsx: 어떤 이벤트를 구독해서 서브에이전트·스킬·MCP·백그라운드 작업 정보를 모으는지
- view.tsx: 패널을 어떻게 그리는지(탭, 헤더, 표)
- pet.tsx, cat-sprites.ts: 상태에 따라 캐릭터 동작을 고르는 방식
그리고 최소 기능 버전(패널 열기/닫기 + 서브에이전트 목록)만 먼저 만드는 계획을 세워줘.
```

```
계획대로 my-marketplace/plugins/<내 대시보드 이름> 에 최소 기능 버전을 만들어줘.
- /<명령 이름> 으로 패널을 열고 닫기
- 서브에이전트 이름, 모델, 상태를 표로 표시
`claude plugin validate`로 검증하고 marketplace.json에 등록해줘.
```

```
최소 버전에 기능을 하나씩 추가해줘. 하나를 추가할 때마다 검증하고 나한테 확인받아줘.
1. 스킬과 MCP 사용 현황
2. 백그라운드 작업 목록
3. 탭 전환
4. (선택) 상태에 따라 움직이는 캐릭터. 그림은 내가 정하거나 새로 그려줘.
Anthropic이나 Claude 로고처럼 상표가 있는 그림은 넣지 마.
```

## 6단계: 로컬 설치와 테스트

```
my-marketplace 를 로컬 마켓플레이스로 등록하고 내가 만든 플러그인을 설치해줘.
claude plugin marketplace add "<my-marketplace 절대경로>" --scope user
claude plugin install <플러그인>@<내 마켓플레이스 이름> --scope user
`claude plugin list`로 enabled 상태를 확인한 다음, 새 세션에서 무엇을 입력하고 무엇을 확인하면 되는지 플러그인별로 체크리스트를 만들어줘.
```

수정한 뒤에는 열린 세션에서 `/reload-plugins`를 실행하면 바로 반영됩니다.

## 7단계: GitHub에 올려서 공유

```
my-marketplace 를 GitHub 공개 저장소로 올리려고 해. 올리기 전에 아래를 확인해줘.
1. 개인 경로, 토큰, API 키, 이메일 같은 개인 정보가 없는지 검사
2. 다른 사람의 코드나 그림을 그대로 가져온 부분이 없는지 확인
3. README에 설치 프롬프트 작성 (/plugin marketplace add <내 계정>/<저장소> → 설치 → 검증 순서)
검사 결과를 보여주고 내가 승인하면 그때 저장소를 만들고 push해줘.
```

올린 뒤 다른 사람은 `/plugin marketplace add <내 계정>/<저장소>` 한 줄로 내 마켓플레이스를 추가할 수 있습니다. 마켓플레이스 파일은 반드시 저장소 루트의 `.claude-plugin/marketplace.json`에 두어야 합니다.
