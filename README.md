# claude-mods

Claude Code용 mods입니다. 파일을 내려받을 필요 없이 Claude Code 안에서 프롬프트만으로 설치합니다.

| 플러그인 | 기능 |
|---|---|
| agent-board | 서브에이전트·스킬·MCP·백그라운드 작업 현황 패널, 고양이. `/agent-board`로 열고 닫음 |
| auto-model | 작업 종류별 모델 자동 선택. 기본 꺼짐, `/auto-model on` |
| session-collab | 같은 PC의 다른 Claude Code 세션과 여러 턴 협업. `/session-collab:collab <상대> <작업>` |

요구 사항: Claude Code 2.1.295 이상, Mods 기능을 사용할 수 있는 계정. Linux는 검증하지 않았습니다.

같은 기능을 직접 만들어 보고 싶다면 [BUILD-PROMPTS.md](BUILD-PROMPTS.md)를 참고하세요.

## 설치: 단계별 프롬프트

Claude Code를 실행하고 아래 블록을 한 단계씩 붙여넣으세요.

### 1단계: 마켓플레이스 추가

```
/plugin marketplace add akaz01/claude-mods
```

### 2단계: 환경 점검 (아무것도 바꾸지 않음)

```
claude-mods 플러그인을 설치하려고 해. 아직 아무것도 설치하거나 수정하지 말고 아래 항목만 확인해서 표로 알려줘.
1. 운영체제
2. `claude --version` 결과가 2.1.295 이상인지
3. `claude plugin marketplace list`에 claude-mods가 등록되어 있는지
조건이 하나라도 안 맞으면 해결 방법만 알려주고 멈춰줘.
```

### 3단계: 플러그인 설치

```
claude-mods 마켓플레이스의 플러그인 3개를 user 범위로 설치해줘. 각 명령의 결과를 확인하면서 하나씩 진행해줘.
claude plugin install agent-board@claude-mods --scope user
claude plugin install auto-model@claude-mods --scope user
claude plugin install session-collab@claude-mods --scope user
이미 설치된 플러그인이 있으면 install 대신 `claude plugin update <id> --scope user`를 실행해줘.
settings.json을 직접 수정하지는 마.
```

### 4단계: 설치 검증

```
`claude plugin list --json`으로 agent-board, auto-model, session-collab(@claude-mods)이
모두 user 범위로 설치되어 있고 enabled 상태인지 표로 확인해줘. 꺼져 있으면 `claude plugin enable <id> --scope user`로 켜줘.
```

확인이 끝나면 Claude Code를 종료하고 새 세션을 엽니다. 열린 세션에서는 `/reload-plugins`를 실행해도 됩니다.

### 5단계: 새 세션에서 동작 확인

```
설치한 mods가 실제로 동작하는지 하나씩 확인하려고 해. 순서대로 안내해줘.
1. /agent-board 로 대시보드 패널이 열리는지 (한 번 더 실행하면 닫힘)
2. /auto-model status 로 상태 확인 (기본은 OFF, 쓰고 싶을 때 /auto-model on)
3. session-collab: 다른 터미널에서 Claude Code 세션을 하나 더 연 뒤 /session-collab:collab 으로 연결되는지
각 항목마다 내가 무엇을 입력하고 화면에서 무엇을 확인하면 되는지 알려줘.
```

## 함께 쓰면 좋은 예제 mods (직접 설치)

blast-radius(위험한 셸 명령 미리보기), replay-theater(직전 턴 수정 재생), token-weather(컨텍스트 상태 표시)는
[anthropics/claude-code-playground](https://github.com/anthropics/claude-code-playground) 저장소에서 제공하는 예제 mods입니다.
이 저장소에는 포함하지 않으니 원본에서 직접 설치하세요.

원본의 마켓플레이스 파일은 저장소 루트가 아니라 `claude-code/mods` 폴더에 있어서 `/plugin marketplace add anthropics/claude-code-playground`로는 추가되지 않습니다.
저장소를 내려받은 뒤 그 폴더를 로컬 마켓플레이스로 등록해야 합니다.

```
anthropics/claude-code-playground의 예제 mods를 설치하고 싶어. 순서대로 진행하고 각 단계 결과를 알려줘.
1. git이 설치되어 있는지 확인해줘. 없으면 설치 방법만 알려주고 멈춰줘.
2. 홈 폴더 아래 Tools 폴더에 저장소를 내려받아줘. 이미 있으면 덮어쓰지 말고 `git pull`만 해줘.
   git clone --depth 1 https://github.com/anthropics/claude-code-playground <홈>/Tools/claude-code-playground
3. 내려받은 폴더의 claude-code/mods 를 마켓플레이스로 등록해줘.
   claude plugin marketplace add "<홈>/Tools/claude-code-playground/claude-code/mods" --scope user
4. 원하는 플러그인을 설치해줘.
   claude plugin install blast-radius@claude-code-playground-mods --scope user
   claude plugin install replay-theater@claude-code-playground-mods --scope user
   claude plugin install token-weather@claude-code-playground-mods --scope user
5. `claude plugin list`로 설치 결과를 확인해줘.
Tools/claude-code-playground 폴더는 마켓플레이스가 가리키는 경로라서 지우거나 옮기면 안 된다는 점도 알려줘.
```

- 원본 그대로 설치되며, 원본 저장소의 라이선스와 안내를 따릅니다.
- 원본은 macOS 기준으로 작성되어 있어 Windows에서는 일부 기능(특히 blast-radius)이 제대로 동작하지 않을 수 있습니다.
- 업데이트할 때는 해당 폴더에서 `git pull`을 한 다음 `claude plugin marketplace update claude-code-playground-mods`를 실행합니다.

## 업데이트

```
claude-mods를 최신 버전으로 업데이트해줘.
`claude plugin marketplace update claude-mods`를 실행한 다음, 설치된 claude-mods 플러그인마다 `claude plugin update <id> --scope user`를 실행해줘.
```

## 문제가 생겼을 때

```
claude-mods 설치나 실행 중에 문제가 생겼어. 아래 오류를 분석해줘.
[오류 메시지 붙여넣기]
설정 파일을 직접 수정하기 전에 무엇을 바꿀지 먼저 보여주고 내 승인을 받아줘.
managed settings나 rollout 플래그는 건드리지 마.
```

## 제거

```
claude-mods 플러그인 3개를 제거하고 싶어. 실행할 명령 목록을 먼저 보여주고 내가 승인하면 실행해줘.
`claude plugin uninstall <id>@claude-mods --scope user`로 3개를 제거하고 마지막에 `claude plugin marketplace remove claude-mods`를 실행하는 거야.
```

## 알아둘 점

- auto-model에 설정된 모델은 설치한 사람의 계정에서도 사용할 수 있어야 합니다.
- 사용 한도는 로그인한 계정의 실제 조회값만 표시합니다.
- agent-board의 Claude 마크를 포함해 Anthropic과 Claude 명칭 및 마크는 Anthropic의 상표입니다. 이 저장소는 Anthropic과 제휴하거나 승인받은 것이 아닙니다.
