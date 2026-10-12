# claude-mods

Claude Code 화면에 기능을 더해 주는 mods(플러그인) 6개입니다.
Claude Code에 아래 문장을 **복사해서 붙여넣기만** 하면 Claude가 설치를 진행합니다.

| 플러그인 | 무엇을 해 주나요 | 쓰는 법 |
|---|---|---|
| agent-board | 서브에이전트·스킬·MCP·백그라운드 작업 현황을 보여 주는 패널 (고양이 포함) | `/agent-board` 입력으로 열고 닫기 |
| auto-model | 작업 종류에 맞춰 모델(Haiku/Sonnet/Opus)을 자동으로 골라 줌 | 기본 꺼짐. `/auto-model on`으로 켜기 |
| session-collab | 같은 PC에서 열린 다른 Claude Code 창과 대화하며 협업 | `/session-collab:collab <상대 이름> <맡길 일>` |
| blast-radius | 파일을 지우는 위험한 명령(rm -rf, git reset --hard 등)을 실행 전에 멈추고 영향을 보여 줌 | 자동. 진행/취소 버튼이 뜸 |
| replay-theater | Claude가 방금 고친 파일 내용을 한 단계씩 다시 보여 줌 | 수정 후 입력창 위의 `Replay` 버튼 |
| token-weather | 대화 기억 공간(context) 사용량을 신호등 색으로 표시 | 자동. 입력창 바로 위 |

## 내 운영체제 고르기

아래에서 **내 컴퓨터의 운영체제 제목을 누르면** 그 운영체제의 설치 안내만 펼쳐집니다.

<details>
<summary><b>Windows 설치 안내 (여기를 눌러 펼치기)</b></summary>

### 시작하기 전에 (처음 한 번만)

**필요한 것**

- **Claude Code 2.1.295 이상**이 설치되어 있고 로그인되어 있어야 합니다.
- **Git for Windows**: blast-radius가 사용합니다. 없으면 1단계에서 Claude가 설치 방법을 알려 줍니다.
- **Mods 기능을 쓸 수 있는 계정**: 1단계에서 자동으로 확인합니다.

**Claude Code 여는 법**

1. 시작 메뉴에서 **PowerShell** 또는 **터미널**을 검색해서 엽니다.
2. `claude` 를 입력하고 Enter를 누릅니다.
3. 아래쪽에 입력창이 보이면 준비된 것입니다. 이 문서의 회색 상자 안 내용을 복사해서 입력창에 붙여넣고 Enter를 누르세요.

**꼭 알아둘 것**

- Claude가 **"이 명령을 실행해도 될까요?"**라고 물으면 내용을 읽고 `Yes`를 고르세요. 설치 명령을 실행하려면 허락이 필요합니다.
- `/`로 시작하는 줄은 **슬래시 명령**입니다. 입력창에 그대로 입력하면 바로 실행됩니다.
- 각 단계의 결과를 확인한 뒤 다음 단계로 넘어가세요.

### 1단계: 준비 상태 점검 (아무것도 바꾸지 않음)

```
claude-mods 플러그인을 설치하려고 해. 나는 Windows를 쓰는 초보자야. 아직 아무것도 설치하거나 바꾸지 말고 아래 항목만 확인해서 표로 알려줘.
1. `claude --version` 결과가 2.1.295 이상인지
2. Git for Windows의 bash.exe가 있는지와 그 전체 경로 (보통 C:\Program Files\Git\bin\bash.exe)
3. Mods 기능을 쓸 수 있는지: 새로 만든 빈 임시 폴더에서 `claude plugin test`를 실행해서
   "no hooks module to load"가 나오면 사용 가능이야. 확인이 끝나면 그 빈 임시 폴더는 지워줘.
하나라도 안 되면, 내가 따라 할 수 있게 해결 방법을 쉬운 말로 한 단계씩 알려주고 멈춰줘.
```

**성공하면:** 세 항목이 모두 "OK"인 표가 나옵니다.

**안 되면:**
- 버전이 낮다고 나오면 터미널에서 `claude update`를 실행한 뒤 1단계를 다시 하세요.
- Git이 없다고 나오면 PowerShell에서 `winget install --id Git.Git -e`를 실행하거나 https://git-scm.com/downloads/win 에서 설치하세요. 그다음 터미널을 닫았다가 다시 열고 1단계를 다시 하세요.
- Mods를 쓸 수 없다고 나오면 지금 계정이나 버전에서는 이 플러그인들이 동작하지 않습니다.

### 2단계: 설치

```
claude-mods 플러그인 6개를 설치해줘. 명령을 하나씩 실행하고 각 결과를 확인해줘.
1. claude plugin install agent-board --marketplace akaz01/claude-mods --scope user
   (이 명령이 claude-mods 마켓플레이스 등록과 첫 번째 설치를 함께 해)
2. claude plugin install auto-model@claude-mods --scope user
3. claude plugin install session-collab@claude-mods --scope user
4. claude plugin install replay-theater@claude-mods --scope user
5. claude plugin install token-weather@claude-mods --scope user
6. 1단계에서 찾은 bash.exe 전체 경로를 넣어서 blast-radius를 설치해줘.
   claude plugin install blast-radius@claude-mods --scope user --config "bashExecutable=<bash.exe 전체 경로>"
"already installed"가 나오면 이미 설치된 것이니 다음으로 넘어가면 돼.
settings.json 같은 설정 파일을 직접 고치지는 마.
```

**성공하면:** 각 줄마다 `✔ Successfully installed plugin`이나 `already installed`가 나옵니다.

### 3단계: 설치 결과 확인

```
`claude plugin list --json`으로 claude-mods 플러그인 6개가 모두 설치되어 있고 켜져(enabled) 있는지 표로 보여줘.
버전도 아래와 같은지 확인해줘.
agent-board 0.7.0, auto-model 0.1.1, session-collab 0.1.0, blast-radius 0.1.1, replay-theater 0.1.2, token-weather 0.2.1
꺼져 있는 것이 있으면 `claude plugin enable <이름>@claude-mods --scope user`로 켜줘.
그리고 `claude plugin configure blast-radius@claude-mods`를 실행해서 bashExecutable 옆에 "set"이라고 나오는지도 확인해줘. "not set"이면 Git Bash 경로가 빠진 거야.
```

**성공하면:** 6줄 모두 enabled이고 버전이 같은 표가 나옵니다.

### 4단계: 새로 시작하기

설치한 기능은 **새로 시작한 Claude Code에서** 동작합니다. 입력창에 `/exit`를 입력해 종료한 다음 `claude`로 다시 시작하세요. 또는 지금 창에서 `/reload-plugins`를 입력해도 됩니다.

### 5단계: 하나씩 써 보기

아래 [공통: 설치 후 써 보기](#공통-설치-후-써-보기)의 프롬프트를 붙여넣으세요.

### Claude에게 맡기지 않고 직접 설치하기

`claude`를 실행하기 전의 PowerShell에 한 줄씩 입력합니다.

```
claude plugin install agent-board --marketplace akaz01/claude-mods --scope user
claude plugin install auto-model@claude-mods --scope user
claude plugin install session-collab@claude-mods --scope user
claude plugin install replay-theater@claude-mods --scope user
claude plugin install token-weather@claude-mods --scope user
claude plugin install blast-radius@claude-mods --scope user --config "bashExecutable=C:\Program Files\Git\bin\bash.exe"
```

마지막 줄의 경로는 Git을 기본 위치에 설치한 경우입니다.

### Windows에서 자주 생기는 문제

| 화면에 나온 말 / 증상 | 원인 | 해결 |
|---|---|---|
| `claude` 실행 시 "스크립트를 실행할 수 없으므로" | PowerShell 실행 정책이 막음 | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` 실행 후 터미널을 다시 열기 |
| `1 userConfig option not yet set` (blast-radius) | Git Bash 경로를 넣지 않고 설치함 | Claude Code 입력창에 `/plugin configure blast-radius@claude-mods`를 입력하고 bash.exe 전체 경로 넣기 |
| `winget`을 찾을 수 없음 | 오래된 Windows | https://git-scm.com/downloads/win 에서 직접 내려받아 설치 |

그 밖의 문제는 아래 [공통: 자주 생기는 문제](#공통-자주-생기는-문제)를 보세요.

</details>

<details>
<summary><b>macOS 설치 안내 (여기를 눌러 펼치기)</b></summary>

macOS에서는 두 가지 방법이 있습니다. **방법 1(마켓플레이스)을 권장합니다.** 최신 버전 6개가 모두 설치되고 업데이트도 쉽습니다.
방법 2는 저장소에 함께 올려 둔 `mac_os_mods.zip` 패키지를 쓰는 방법입니다.

### 시작하기 전에 (처음 한 번만)

**필요한 것**

- **Claude Code 2.1.295 이상**이 설치되어 있고 로그인되어 있어야 합니다.
- **Mods 기능을 쓸 수 있는 계정**: 1단계에서 자동으로 확인합니다.
- macOS에는 bash와 zsh가 기본으로 있어서 따로 설치할 것이 없습니다.

**Claude Code 여는 법**

1. Spotlight(⌘ + Space)에서 **터미널**을 검색해서 엽니다.
2. `claude` 를 입력하고 Enter를 누릅니다.
3. 아래쪽에 입력창이 보이면 준비된 것입니다. 이 문서의 회색 상자 안 내용을 복사(⌘C)해서 입력창에 붙여넣고(⌘V) Enter를 누르세요.

**꼭 알아둘 것**

- Claude가 **"이 명령을 실행해도 될까요?"**라고 물으면 내용을 읽고 `Yes`를 고르세요.
- `/`로 시작하는 줄은 **슬래시 명령**입니다. 입력창에 그대로 입력하면 바로 실행됩니다.
- 각 단계의 결과를 확인한 뒤 다음 단계로 넘어가세요.

### 방법 1: 마켓플레이스로 설치 (권장)

#### 1단계: 준비 상태 점검 (아무것도 바꾸지 않음)

```
claude-mods 플러그인을 설치하려고 해. 나는 macOS를 쓰는 초보자야. 아직 아무것도 설치하거나 바꾸지 말고 아래 항목만 확인해서 표로 알려줘.
1. `claude --version` 결과가 2.1.295 이상인지
2. Mods 기능을 쓸 수 있는지: 새로 만든 빈 임시 폴더에서 `claude plugin test`를 실행해서
   "no hooks module to load"가 나오면 사용 가능이야. 확인이 끝나면 그 빈 임시 폴더는 지워줘.
하나라도 안 되면, 내가 따라 할 수 있게 해결 방법을 쉬운 말로 한 단계씩 알려주고 멈춰줘.
```

**성공하면:** 두 항목이 모두 "OK"인 표가 나옵니다.

**안 되면:** 버전이 낮다고 나오면 터미널에서 `claude update`를 실행한 뒤 1단계를 다시 하세요. Mods를 쓸 수 없다고 나오면 지금 계정이나 버전에서는 이 플러그인들이 동작하지 않습니다.

#### 2단계: 설치

```
claude-mods 플러그인 6개를 설치해줘. 명령을 하나씩 실행하고 각 결과를 확인해줘.
1. claude plugin install agent-board --marketplace akaz01/claude-mods --scope user
   (이 명령이 claude-mods 마켓플레이스 등록과 첫 번째 설치를 함께 해)
2. claude plugin install auto-model@claude-mods --scope user
3. claude plugin install session-collab@claude-mods --scope user
4. claude plugin install replay-theater@claude-mods --scope user
5. claude plugin install token-weather@claude-mods --scope user
6. claude plugin install blast-radius@claude-mods --scope user
"already installed"가 나오면 이미 설치된 것이니 다음으로 넘어가면 돼.
settings.json 같은 설정 파일을 직접 고치지는 마.
```

**성공하면:** 각 줄마다 `✔ Successfully installed plugin`이나 `already installed`가 나옵니다.

#### 3단계: 설치 결과 확인

```
`claude plugin list --json`으로 claude-mods 플러그인 6개가 모두 설치되어 있고 켜져(enabled) 있는지 표로 보여줘.
버전도 아래와 같은지 확인해줘.
agent-board 0.7.0, auto-model 0.1.1, session-collab 0.1.0, blast-radius 0.1.1, replay-theater 0.1.2, token-weather 0.2.1
꺼져 있는 것이 있으면 `claude plugin enable <이름>@claude-mods --scope user`로 켜줘.
```

#### 4단계: 새로 시작하기

입력창에 `/exit`를 입력해 종료한 다음 `claude`로 다시 시작하세요. 또는 지금 창에서 `/reload-plugins`를 입력해도 됩니다.

#### 5단계: 하나씩 써 보기

아래 [공통: 설치 후 써 보기](#공통-설치-후-써-보기)의 프롬프트를 붙여넣으세요.

#### Claude에게 맡기지 않고 직접 설치하기

`claude`를 실행하기 전의 터미널에 한 줄씩 입력합니다.

```
claude plugin install agent-board --marketplace akaz01/claude-mods --scope user
claude plugin install auto-model@claude-mods --scope user
claude plugin install session-collab@claude-mods --scope user
claude plugin install replay-theater@claude-mods --scope user
claude plugin install token-weather@claude-mods --scope user
claude plugin install blast-radius@claude-mods --scope user
```

### 방법 2: mac_os_mods.zip 패키지로 설치

macOS에서 처음 만들고 검증한 원래 패키지입니다(Claude Code 2.1.296에서 검증). 방법 1과 비교하면 다음이 다릅니다.

| | 방법 1 (마켓플레이스) | 방법 2 (ZIP) |
|---|---|---|
| 플러그인 수 | 6개 | 5개 (session-collab 없음) |
| 버전 | 최신 | auto-model 0.1.0, replay-theater 0.1.0, token-weather 0.2.0 |
| 신호등과 Replay 안내 | 함께 표시 | 파일을 고친 뒤에는 Replay 안내가 신호등을 가림 |
| auto-model 모델 지정 | haiku/sonnet/opus 별칭 (어느 계정이든 동작) | 고정 모델 ID (계정에 따라 동작하지 않을 수 있음) |
| 업데이트 | 명령 한 번 | ZIP을 다시 받아 설치 |

> **주의:** 방법 1과 방법 2를 함께 설치하지 마세요. 같은 기능이 두 번 설치되어 화면에 두 번 나옵니다. 바꾸려면 먼저 [제거](#제거)한 뒤 설치하세요.

#### 1단계: 내려받기와 무결성 확인

```
claude-mods 저장소의 macOS용 패키지 mac_os_mods.zip을 설치하려고 해. 나는 macOS를 쓰는 초보자야. 순서대로 진행하고 각 단계 결과를 알려줘.
1. `claude --version`이 2.1.295 이상인지 확인해줘.
2. https://github.com/akaz01/claude-mods/raw/main/mac_os_mods.zip 를 curl -L 로 ~/Downloads/mac_os_mods.zip 에 내려받아줘.
3. `shasum -a 256 ~/Downloads/mac_os_mods.zip` 결과가 아래 값과 같은지 확인해줘. 다르면 바로 멈춰줘.
   70ccb51757215083e20da7ba53d065362ad3cd946a241e5a0bda33a68417e77c
4. 같으면 ~/Tools 폴더에 압축을 풀어줘. 결과가 ~/Tools/Mods 가 되어야 해. 이미 ~/Tools/Mods 가 있으면 덮어쓰지 말고 나한테 물어봐줘.
5. ~/Tools/Mods 폴더에서 `shasum -a 256 -c SHA256SUMS`를 실행해서 모든 파일이 OK인지 확인해줘.
~/Tools/Mods 폴더는 설치 후에도 지우거나 옮기면 안 된다는 점도 알려줘.
```

#### 2단계: 설치

```
~/Tools/Mods 폴더에서 먼저 `zsh install.command --print-only`로 실행될 명령을 보여주고,
문제가 없으면 `zsh install.command`를 실행해서 설치해줘. 끝나면 `claude plugin list`로 아래 5개가 설치되어 있는지 표로 보여줘.
agent-board@my-mods, auto-model@my-mods, blast-radius@claude-code-playground-mods, replay-theater@claude-code-playground-mods, token-weather@claude-code-playground-mods
```

#### 3단계: 새로 시작하고 써 보기

`/exit`로 종료한 다음 `claude`로 다시 시작하세요. 그다음 [공통: 설치 후 써 보기](#공통-설치-후-써-보기)의 프롬프트를 붙여넣으세요. session-collab은 이 패키지에 없으니 그 항목은 건너뜁니다.

### macOS에서 자주 생기는 문제

| 화면에 나온 말 / 증상 | 원인 | 해결 |
|---|---|---|
| `command not found: claude` | Claude Code가 설치되지 않았거나 경로(PATH)에 없음 | Claude Code를 설치한 뒤 터미널을 다시 열기 |
| Finder에서 install.command를 열면 "확인되지 않은 개발자" 경고 | macOS 보안 기능(Gatekeeper) | Finder 대신 터미널에서 `zsh install.command`로 실행 |
| 방법 2 설치 중 마켓플레이스(my-mods 등)가 이미 있다는 오류 | 예전에 다른 위치의 Mods 폴더로 설치한 적이 있음 | Claude에게 `claude plugin marketplace list` 결과를 보여 달라고 한 뒤 예전 등록을 지울지 결정 |

그 밖의 문제는 아래 [공통: 자주 생기는 문제](#공통-자주-생기는-문제)를 보세요.

</details>

---

## 공통: 설치 후 써 보기

새로 시작한 Claude Code에 붙여넣으세요.

```
방금 설치한 mods가 잘 동작하는지 하나씩 같이 확인하고 싶어. 나는 초보자니까 한 번에 하나씩 안내해줘.
1. agent-board: 내가 /agent-board 를 입력하면 패널이 열리고, 한 번 더 입력하면 닫히는지
2. auto-model: 내가 /auto-model status 를 입력하면 "꺼짐" 상태가 나오는지
3. token-weather: 네가 짧게 한 번 대답한 뒤 입력창 바로 위에 ● 신호등 줄이 보이는지
4. replay-theater: 시스템 임시 폴더에 테스트용 파일을 하나 만들고 한 줄 고쳐줘. 그 뒤 입력창 위에 Replay 버튼이 보이는지
5. blast-radius: 시스템 임시 폴더 안에 테스트 폴더를 새로 만들고 그 폴더만 rm -rf 로 지우는 명령을 실행해줘.
   진행/취소 버튼이 나오면 내가 취소를 누를 거야. 그 뒤 테스트 폴더가 그대로 남아 있는지 확인해줘.
각 항목마다 내가 무엇을 입력하고 화면 어디를 보면 되는지 알려줘. 내 프로젝트 파일은 절대 건드리지 마.
```

session-collab은 Claude Code 창이 두 개 필요합니다. 터미널을 하나 더 열어 `claude`를 실행한 뒤, 한쪽 창에서 `/session-collab:collab <상대 창 이름> <맡길 일>`을 입력하세요. 상대 창 이름은 Claude에게 "다른 세션 목록 보여줘"라고 하면 알 수 있습니다.

## 공통: 자주 생기는 문제

| 화면에 나온 말 / 증상 | 원인 | 해결 |
|---|---|---|
| `Plugin "..." not found in marketplace "claude-mods"` | 플러그인 이름 오타 | 위 표의 이름을 그대로 복사해서 다시 입력 |
| `Repository not found` | 저장소 이름 오타 | `akaz01/claude-mods`인지 확인 (끝에 s가 있음) |
| `/agent-board`를 입력해도 반응이 없음 | 설치 후 새로 시작하지 않음 | `/reload-plugins` 입력 또는 Claude Code 다시 시작 |
| 신호등이 안 보임 | 새 대화에서 아직 응답이 한 번도 없음 (첫 응답 뒤에 나타남) | Claude에게 아무 말이나 한 번 보내기 |
| 위 방법으로도 안 됨 | — | 아래 프롬프트로 Claude에게 진단 맡기기 |

```
claude-mods 설치나 실행 중에 문제가 생겼어. 나는 초보자야. 아래 오류를 분석해서 쉬운 말로 원인과 해결 방법을 알려줘.
[여기에 운영체제와 오류 메시지나 증상을 붙여넣기]
설정 파일을 고쳐야 한다면 무엇을 왜 바꾸는지 먼저 보여주고 내 허락을 받아줘. managed settings는 건드리지 마.
```

## 업데이트

마켓플레이스로 설치한 경우(Windows, macOS 방법 1) 붙여넣으세요.

```
claude-mods를 최신 버전으로 업데이트해줘.
먼저 `claude plugin marketplace update claude-mods`를 실행하고, 설치된 claude-mods 플러그인마다 `claude plugin update <이름>@claude-mods --scope user`를 실행해줘.
끝나면 버전 표를 보여줘.
```

업데이트한 뒤에는 `/reload-plugins`를 입력하거나 Claude Code를 다시 시작하세요. macOS 방법 2(ZIP)로 설치했다면 방법 1로 바꾸는 것을 권장합니다.

## 제거

```
claude-mods로 설치한 플러그인을 지우고 싶어. 실행할 명령 목록을 먼저 보여주고 내가 허락하면 실행해줘.
- 마켓플레이스로 설치한 경우: `claude plugin uninstall <이름>@claude-mods --scope user`로 6개를 지우고 `claude plugin marketplace remove claude-mods`
- macOS ZIP으로 설치한 경우: @my-mods 와 @claude-code-playground-mods 플러그인 5개를 uninstall 하고,
  `claude plugin marketplace remove my-mods`, `claude plugin marketplace remove claude-code-playground-mods`
`claude plugin list`로 어떤 방식으로 설치되어 있는지 먼저 확인해줘.
```

---

## 용어 풀이

- **Claude Code**: 터미널에서 쓰는 Claude입니다. `claude`를 입력하면 시작됩니다.
- **플러그인 / mod**: Claude Code에 기능을 더하는 작은 확장입니다.
- **마켓플레이스**: 플러그인 목록입니다. 이 저장소가 `claude-mods`라는 이름의 마켓플레이스입니다.
- **슬래시 명령**: `/agent-board`처럼 `/`로 시작하는 명령입니다. 입력창에 입력하면 바로 실행됩니다.
- **context(컨텍스트)**: Claude가 지금 대화에서 기억하고 있는 내용의 양입니다. 가득 차면 오래된 내용을 요약(compact)합니다. token-weather 신호등이 초록(50% 미만) → 노랑 → 빨강 순으로 알려 줍니다.

## 알아둘 점

- auto-model이 고르는 모델은 설치한 사람의 계정에서 쓸 수 있는 모델이어야 합니다.
- agent-board의 사용 한도 표시는 로그인한 계정의 실제 값만 보여 줍니다.
- 같은 기능을 직접 만들어 보고 싶다면 [BUILD-PROMPTS.md](BUILD-PROMPTS.md)를 참고하세요.
- blast-radius, replay-theater, token-weather는 Apache License 2.0 예제 코드를 수정한 버전입니다(mac_os_mods.zip 안의 사본 포함). 라이선스 조건에 따라 [NOTICE](NOTICE)와 [LICENSE-APACHE-2.0](LICENSE-APACHE-2.0)을 함께 둡니다.
- Anthropic과 Claude 명칭 및 마크는 Anthropic의 상표입니다. 이 저장소는 Anthropic과 제휴하거나 승인받은 것이 아닙니다.
