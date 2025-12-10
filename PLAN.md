# NIfTI Liver Metastasis Viewer - 구현 계획

## 개요
복부 CT NIfTI 파일을 웹에서 보고 간 전이 여부를 기록하는 다중 사용자 연구용 뷰어

## 두 가지 모드

### 일반 모드 (Local Mode)
- 백엔드 불필요, 프론트엔드만 사용
- 사용자가 로컬에서 NIfTI 파일을 직접 선택
- 파일 드래그앤드롭 또는 파일 선택 버튼
- 브라우저에서 바로 렌더링

### 연구 모드 (Research Mode)
- 백엔드 서버 연결 필요
- 로그인 후 사용
- 서버의 지정 데이터 폴더에서 NIfTI 파일 목록 표시
- **랜덤 선택** 버튼으로 미판독 케이스 중 하나 랜덤 로드
- 판독 기록(전이 유무, 병변 위치) 저장

## 기술 스택

### Frontend
- **React 18 + TypeScript + Vite**
- **NiiVue** - WebGL2 기반 NIfTI 전용 뷰어 (가장 빠름)
- **Tailwind CSS + shadcn/ui** - 모던 UI
- **Zustand** - 상태 관리
- **TanStack Query** - 서버 상태

### Backend
- **FastAPI** (async)
- **SQLAlchemy 2.0** (async) + **SQLite** (간단한 설정)
- **세션 기반 인증** (쿠키, JWT 불필요)
- **nibabel** - NIfTI 메타데이터 파싱

---

## 프로젝트 구조

```
viewer/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── viewer/
│   │   │   │   ├── NiiVueViewer.tsx      # 핵심 뷰어
│   │   │   │   ├── ViewerToolbar.tsx     # 윈도우/줌 컨트롤
│   │   │   │   ├── OverlayControls.tsx   # 세그멘테이션 오버레이 컨트롤
│   │   │   │   └── SliceNavigator.tsx    # 슬라이스 네비게이션
│   │   │   ├── annotation/
│   │   │   │   ├── AnnotationPanel.tsx   # 판독 기록 패널
│   │   │   │   ├── LesionMarker.tsx      # 병변 마킹
│   │   │   │   └── LesionList.tsx        # 마킹된 병변 목록
│   │   │   └── ui/                       # shadcn 컴포넌트
│   │   ├── pages/
│   │   │   ├── HomePage.tsx              # 모드 선택 (일반/연구)
│   │   │   ├── LocalViewerPage.tsx       # 일반 모드 - 로컬 파일 뷰어
│   │   │   ├── LoginPage.tsx             # 연구 모드 로그인
│   │   │   ├── StudyListPage.tsx         # 연구 모드 - 스터디 목록
│   │   │   └── ResearchViewerPage.tsx    # 연구 모드 - 뷰어 + 판독
│   │   ├── hooks/
│   │   │   ├── useNiivue.ts
│   │   │   ├── useKeyboardNavigation.ts
│   │   │   └── useWheelNavigation.ts    # 마우스 휠 스크롤
│   │   └── stores/
│   │       └── viewerStore.ts
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── auth.py
│   │   │   ├── studies.py
│   │   │   └── annotations.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── study.py
│   │   │   └── annotation.py
│   │   ├── services/
│   │   │   ├── nifti_service.py
│   │   │   └── folder_scanner.py   # 데이터 폴더 스캔
│   │   └── main.py
│   ├── requirements.txt
│   └── data.db                       # SQLite 파일
│
└── README.md
```

---

## 데이터베이스 스키마

### users (간소화)
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | PK, 자동 증가 |
| username | VARCHAR | 로그인 ID |
| password_hash | VARCHAR | 해시된 비밀번호 |
| name | VARCHAR | 의사 이름 |

### studies
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | PK |
| patient_id | VARCHAR | 환자 ID (익명화) |
| file_path | VARCHAR | NIfTI 파일 경로 |
| description | TEXT | 설명 |
| created_at | DATETIME | 업로드 시간 |

### annotations
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | PK |
| study_id | INTEGER | FK -> studies |
| user_id | INTEGER | FK -> users |
| metastasis_present | BOOLEAN | 전이 유무 |
| lesion_count | INT | 병변 개수 |
| notes | TEXT | 소견 |

### lesion_markers
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | PK |
| annotation_id | INTEGER | FK -> annotations |
| x, y, z | INT | 복셀 좌표 |
| label | VARCHAR | 병변 라벨 |

---

## 핵심 API (연구 모드 전용)

```
# 인증
POST   /api/auth/login                 # 로그인 -> 세션 쿠키
POST   /api/auth/logout                # 로그아웃
GET    /api/auth/me                    # 현재 사용자

# 스터디 (서버 데이터 폴더 기반)
GET    /api/studies                    # 데이터 폴더의 NIfTI 목록
GET    /api/studies/random             # 미판독 중 랜덤 1개 선택
GET    /api/studies/{id}/file          # NIfTI 파일 스트리밍

# 판독 기록
POST   /api/studies/{id}/annotations   # 판독 기록 저장
GET    /api/studies/{id}/annotations   # 판독 기록 조회

# 병변 마커
POST   /api/annotations/{id}/markers   # 병변 마커 추가
DELETE /api/markers/{id}               # 병변 마커 삭제
```

---

## 성능 최적화 포인트

1. **NiiVue WebGL2**: GPU 가속 렌더링, 10x 빠른 리슬라이싱
2. **마우스 휠 스크롤**: 뷰어 위에서 휠로 슬라이스 이동
3. **키보드 네비게이션**: 화살표 키로 슬라이스 스크롤
4. **CT 윈도잉 프리셋**: 복부(40/400), 간(60/150)
5. **파일 스트리밍**: 64KB 청크 단위 async 전송
6. **Debounced 저장**: 500ms 디바운스로 API 호출 최소화

---

## 구현 순서

### Phase 1: 프로젝트 셋업
1. Vite + React + TypeScript 초기화
2. Tailwind + shadcn/ui 설정
3. 모드 선택 홈페이지 구현

### Phase 2: 일반 모드 (Local Mode) - 백엔드 불필요
4. 로컬 파일 선택 UI (드래그앤드롭 + 파일 버튼)
5. NiiVue 통합 및 볼륨 로딩
6. 슬라이스 네비게이션 (슬라이더 + 키보드 + 마우스 휠)
7. 윈도잉 컨트롤 (복부/간 프리셋)
8. 멀티플레인 뷰 (Axial/Coronal/Sagittal)
9. **세그멘테이션 오버레이 기능** ← 신규

### Phase 2.5: 세그멘테이션 오버레이 기능

#### 기능 설명
- CT 영상에 세그멘테이션 레이블 NIfTI 파일을 오버레이
- 오버레이 on/off 토글
- 오버레이 투명도 조절 (0% ~ 100%)
- **멀티클래스 지원**: 각 라벨 값(integer)마다 다른 색상 표시

#### 수정 파일
| 파일 | 변경 내용 |
|------|-----------|
| `frontend/src/stores/viewerStore.ts` | 오버레이 상태 추가 (hasOverlay, visible, opacity) |
| `frontend/src/components/viewer/NiiVueViewer.tsx` | segmentationFile prop, 오버레이 로딩 로직 |
| `frontend/src/components/viewer/OverlayControls.tsx` | **신규** - 오버레이 컨트롤 UI |
| `frontend/src/pages/LocalViewerPage.tsx` | 세그멘테이션 파일 입력 연결 |

#### 구현 단계

**Step 1: viewerStore.ts 확장**
```typescript
// 추가 상태
hasOverlay: boolean           // 오버레이 로드 여부
overlayVisible: boolean       // 표시 on/off
overlayOpacity: number        // 0-1 투명도
overlayFileName: string | null

// 추가 액션
setOverlayLoaded: (fileName: string) => void
setOverlayVisible: (visible: boolean) => void
setOverlayOpacity: (opacity: number) => void
clearOverlay: () => void
```

**Step 2: OverlayControls.tsx 생성**
- 오버레이 미로드: "Load Segmentation" 버튼
- 오버레이 로드됨:
  - 파일명 표시
  - 👁 가시성 토글 버튼
  - Opacity 슬라이더 (0~100%)
  - ✕ 제거 버튼

**Step 3: NiiVueViewer.tsx 수정**
```typescript
// Props 추가
interface NiiVueViewerProps {
  file?: File
  url?: string
  segmentationFile?: File  // 추가
}

// useEffect: 세그멘테이션 로딩
// - nv.loadFromArrayBuffer()로 volumes[1]에 오버레이 추가
// - NiiVue가 discrete label values를 자동으로 다른 색상으로 렌더링

// useEffect: Visibility/Opacity 동기화
// - overlayVisible=false → nv.setOpacity(1, 0)
// - overlayVisible=true → nv.setOpacity(1, overlayOpacity)
```

**Step 4: LocalViewerPage.tsx 수정**
```typescript
// 상태 추가
const [segmentationFile, setSegmentationFile] = useState<File | null>(null)
const segmentationInputRef = useRef<HTMLInputElement>(null)

// 핸들러 추가
const triggerSegmentationInput = () => segmentationInputRef.current?.click()
const clearSegmentation = () => { ... }

// JSX
// - <OverlayControls /> 컴포넌트 추가
// - Hidden <input type="file"> 추가
// - NiiVueViewer에 segmentationFile prop 전달
```

#### NiiVue API 사용
```typescript
// 오버레이 추가
await nv.loadFromArrayBuffer(segBuffer, filename)  // volumes[1]

// 투명도 조절
nv.setOpacity(1, opacity)

// 화면 갱신
nv.updateGLVolume()

// 오버레이 제거
nv.removeVolumeByIndex(1)
```

#### UI 레이아웃
```
┌──────────────────────────────────────────────────────────────┐
│ [←] filename.nii.gz 2.5MB │ [ViewerToolbar] │ [OverlayControls] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                      NiiVueViewer                            │
│                      (CT + Segmentation Overlay)             │
│                                                              │
└──────────────────────────────────────────────────────────────┘

OverlayControls (미로드):
┌────────────────────────┐
│ [📁 Load Segmentation] │
└────────────────────────┘

OverlayControls (로드됨):
┌─────────────────────────────────────────────────────┐
│ seg.nii.gz │ [👁] │ Opacity: ═══════● 50% │ [✕] │
└─────────────────────────────────────────────────────┘
```

### Phase 3: 백엔드 기반 (연구 모드용)
9. FastAPI 프로젝트 구조 생성
10. SQLite 설정
11. 세션 쿠키 기반 인증
12. 데이터 폴더 스캔 API

### Phase 4: 연구 모드 (Research Mode)
13. 로그인 페이지
14. 스터디 목록 (데이터 폴더 기반)
15. 랜덤 선택 기능 (`/api/studies/random`)
16. 뷰어 + 판독 기록 패널
17. 병변 마킹 기능

### Phase 5: UI 완성
18. 모던 다크 테마 UI
19. 로딩/에러 상태 처리
20. 반응형 레이아웃

---

## 주요 파일

| 파일 | 역할 |
|------|------|
| `frontend/src/pages/HomePage.tsx` | 모드 선택 화면 |
| `frontend/src/pages/LocalViewerPage.tsx` | 일반 모드 뷰어 |
| `frontend/src/pages/ResearchViewerPage.tsx` | 연구 모드 뷰어 |
| `frontend/src/components/viewer/NiiVueViewer.tsx` | 핵심 뷰어 컴포넌트 (공용) |
| `frontend/src/components/viewer/OverlayControls.tsx` | 세그멘테이션 오버레이 컨트롤 UI |
| `frontend/src/stores/viewerStore.ts` | Zustand 상태 관리 (뷰어 + 오버레이) |
| `frontend/src/hooks/useNiivue.ts` | NiiVue 인스턴스 관리 |
| `backend/app/api/studies.py` | 스터디 목록 + 랜덤 선택 API |
| `backend/app/services/folder_scanner.py` | 데이터 폴더 스캔 |
| `backend/app/models/annotation.py` | 판독 기록 모델 |
