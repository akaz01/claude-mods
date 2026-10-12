# claude-mods

Claude Code용 mods 6개입니다. 파일을 내려받을 필요 없이 Claude Code 안에서 프롬프트만으로 설치합니다.

| 플러그인 | 기능 | 만든 사람 |
|---|---|---|
| agent-board | 서브에이전트·스킬·MCP·백그라운드 작업 현황 패널, 고양이. `/agent-board`로 열고 닫음 | suhoon |
| auto-model | 작업 종류별 모델 자동 선택. 기본 꺼짐, `/auto-model on` | suhoon |
| session-collab | 같은 PC의 다른 Claude Code 세션과 여러 턴 협업. `/session-collab:collab <상대> <작업>` | suhoon |
| blast-radius | 위험한 셸 명령을 멈추고 변경 범위를 보여줌 | Anthropic 원본, suhoon 수정 |
| replay-theater | 직전 턴의 파일 수정을 diff 단위로 재생 | Anthropic 원본, suhoon 수정 |
| token-weather | 컨텍스트 창 상태를 프롬프트 위에 표시 | Anthropic 원본, suhoon 수정 |

요구 사항: Claude Code 2.1.295 이상, Mods 기능을 사용할 수 있는 계정. Windows는 Git for Windows(Git Bash)가 필요합니다. Linux는 검증하지 않았습니다.

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
3. Windows라면 Git for Windows의 bash.exe 절대경로 (예: C:\Program Files\Git\bin\bash.exe)
4. `claude plugin marketplace list`에 claude-mods가 등록되어 있는지
조건이 하나라도 안 맞으면 해결 방법만 알려주고 멈춰줘.
```

### 3단계: 플러그인 6개 설치

```
claude-mods 마켓플레이스의 플러그인 6개를 user 범위로 설치해줘. 각 명령의 결과를 확인하면서 하나씩 진행해줘.
claude plugin install agent-board@claude-mods --scope user
claude plugin install auto-model@claude-mods --scope user
claude plugin install session-collab@claude-mods --scope user
claude plugin install replay-theater@claude-mods --scope user
claude plugin install token-weather@claude-mods --scope user
blast-radius는 운영체제에 맞게 설치해줘.
- Windows: 2단계에서 찾은 bash.exe 절대경로를 넣어서
  claude plugin install blast-radius@claude-mods --scope user --config "bashExecutable=<bash.exe 절대경로>"
- macOS: claude plugin install blast-radius@claude-mods --scope user
이미 설치된 플러그인이 있으면 install 대신 `claude plugin update <id> --scope user`를 실행해줘.
settings.json을 직접 수정하지는 마.
```

### 4단계: 설치 검증

```
`claude plugin list --json`으로 claude-mods의 6개 플러그인(agent-board, auto-model, session-collab, blast-radius, replay-theater, token-weather)이
모두 user 범위로 설치되어 있고 enabled 상태인지 표로 확인해줘. 꺼져 있는 플러그인은 `claude plugin enable <id> --scope user`로 켜줘.
```

확인이 끝나면 Claude Code를 종료하고 새 세션을 엽니다. 열린 세션에서는 `/reload-plugins`를 실행해도 됩니다.

### 5단계: 새 세션에서 동작 확인

```
설치한 mods가 실제로 동작하는지 하나씩 확인하려고 해. 순서대로 안내해줘.
1. /agent-board 로 대시보드 패널이 열리는지 (한 번 더 실행하면 닫힘)
2. /auto-model status 로 상태 확인 (기본은 OFF, 쓰고 싶을 때 /auto-model on)
3. token-weather 표시가 프롬프트 위에 나타나는지
4. session-collab: 다른 터미널에서 Claude Code 세션을 하나 더 연 뒤 /session-collab:collab 으로 연결되는지
각 항목마다 내가 무엇을 입력하고 화면에서 무엇을 확인하면 되는지 알려줘.
```

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
claude-mods 플러그인 6개를 제거하고 싶어. 실행할 명령 목록을 먼저 보여주고 내가 승인하면 실행해줘.
`claude plugin uninstall <id>@claude-mods --scope user`로 6개를 제거하고 마지막에 `claude plugin marketplace remove claude-mods`를 실행하는 거야.
```

## 알아둘 점

- auto-model에 설정된 모델은 설치한 사람의 계정에서도 사용할 수 있어야 합니다.
- 사용 한도는 로그인한 계정의 실제 조회값만 표시합니다.

## 출처와 라이선스

- **blast-radius, replay-theater, token-weather**: [anthropics/claude-code-playground](https://github.com/anthropics/claude-code-playground)의 `claude-code/mods` 예제를 수정한 버전입니다. Copyright 2026 Anthropic PBC, [Apache License 2.0](LICENSE-APACHE-2.0). 수정한 파일 머리에 변경 사실을 표기했습니다. 변경 내역은 [NOTICE](NOTICE)를 참고하세요.
- **agent-board의 Claude 마크** (`plugins/agent-board/hooks/logo.ts`): Claude 앱 트레이 마크를 터미널 문자로 옮긴 것입니다. Anthropic과 Claude 명칭 및 마크는 Anthropic의 상표입니다.
- **Mods API**: Claude Code가 제공합니다. [문서](https://code.claude.com/docs/en/plugins/mods/reference)
- 이 저장소는 Anthropic과 제휴하거나 승인받은 것이 아니며, Anthropic 공식 배포물이 아닙니다.
