(function (root) {
    'use strict';

    const STORAGE_KEY = 'pet-disaster-planner.v1';
    const DEFAULT_STATE = {
        petName: '',
        species: 'dog',
        days: 7,
        dailyFood: 0,
        dailyWater: 0,
        medication: '',
        ownerName: '',
        ownerPhone: '',
        veterinarian: '',
        veterinarianPhone: '',
        microchip: '',
        primaryShelter: '',
        backupShelter: '',
        meetingPlace: '',
        emergencyContact: '',
        routeNotes: '',
        checks: {}
    };

    const COMMON_CHECKS = [
        ['identity-photo', '最近の写真（全身・顔）', '迷子になったときに特徴を伝えられる写真'],
        ['identity-records', 'ワクチン・健康記録のコピー', '紙とスマートフォンの両方に控える'],
        ['identity-tag', '迷子札・飼い主の連絡先', '最新の電話番号になっているか確認'],
        ['identity-chip', 'マイクロチップ情報', '登録先と連絡先が最新か確認'],
        ['supply-food', 'いつものフード', '急な変更を避けられるよう小分けにする'],
        ['supply-water', '飲料水と折りたたみ食器', '移動中にも使える容器を用意'],
        ['supply-medicine', '常備薬・療法食', '投薬方法と処方元も一緒に控える'],
        ['supply-cleanup', '排泄物の処理用品', '袋、シーツ、消臭用品などをまとめる'],
        ['supply-towel', 'タオル・防寒用品', '目隠しや保温にも使えるもの'],
        ['supply-carrier', 'キャリー・ケージ', '扉と留め具を点検し、普段から慣らす'],
        ['plan-shelter', '同行避難できる避難先を確認', '受入条件は自治体や施設へ事前に確認'],
        ['plan-route', '避難ルートを歩いて確認', '危険箇所と代替ルートも確認する'],
        ['plan-contact', '家族の連絡・集合方法を共有', '飼い主が不在のときの担当も決める'],
        ['plan-temp-care', '一時預け先の候補を確認', '親族、知人、施設など複数候補を持つ'],
        ['plan-practice', 'キャリーに入る練習', '短時間から始めて安心できる場所にする']
    ];

    const SPECIES_CHECKS = {
        dog: [
            ['dog-lead', '予備の首輪・ハーネス・リード', '抜けや破損に備えて予備も用意'],
            ['dog-shoes', '足を守る用品', '瓦礫や熱い路面に備え、無理なく慣らす']
        ],
        cat: [
            ['cat-litter', '猫砂・簡易トイレ', '使い慣れた猫砂を小分けにする'],
            ['cat-net', '洗濯ネット・脱走防止用品', '移動や診察時の飛び出しを防ぐ']
        ]
    };

    function numberInRange(value, min, max) {
        const number = Number(value);
        if (!Number.isFinite(number)) return min;
        return Math.min(max, Math.max(min, number));
    }

    function normalizeState(value) {
        const source = value && typeof value === 'object' ? value : {};
        return {
            ...DEFAULT_STATE,
            ...source,
            species: source.species === 'cat' ? 'cat' : 'dog',
            days: numberInRange(source.days ?? DEFAULT_STATE.days, 3, 14),
            dailyFood: numberInRange(source.dailyFood ?? 0, 0, 10000),
            dailyWater: numberInRange(source.dailyWater ?? 0, 0, 10000),
            checks: source.checks && typeof source.checks === 'object' ? source.checks : {}
        };
    }

    function calculateSupplies(value) {
        const state = normalizeState(value);
        return {
            days: state.days,
            foodGrams: Math.ceil(state.dailyFood * state.days),
            waterMilliliters: Math.ceil(state.dailyWater * state.days)
        };
    }

    function createChecklist(species) {
        const normalizedSpecies = species === 'cat' ? 'cat' : 'dog';
        return COMMON_CHECKS.concat(SPECIES_CHECKS[normalizedSpecies]);
    }

    function completedCount(state) {
        return createChecklist(state.species).filter(([id]) => state.checks[id] === true).length;
    }

    function init() {
        const form = document.getElementById('planner-form');
        if (!form) return;

        const fields = [...form.querySelectorAll('[data-field]')];
        const checklist = document.getElementById('checklist');
        const progressText = document.getElementById('progress-text');
        const progressBar = document.getElementById('progress-bar');
        const foodResult = document.getElementById('food-result');
        const waterResult = document.getElementById('water-result');
        const foodFormula = document.getElementById('food-formula');
        const waterFormula = document.getElementById('water-formula');
        const printable = document.getElementById('printable-plan');
        let state = load();

        function load() {
            try {
                return normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
            } catch (error) {
                return normalizeState({});
            }
        }

        function save() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            } catch (error) {
                // 保存できない環境でも、その場での作成は続けられる。
            }
        }

        function restoreFields() {
            fields.forEach((field) => {
                const key = field.dataset.field;
                field.value = state[key] ?? '';
            });
        }

        function readField(field) {
            const key = field.dataset.field;
            state[key] = field.type === 'number' ? Number(field.value) || 0 : field.value;
            state = normalizeState(state);
            save();
            render();
        }

        function renderSupplies() {
            const result = calculateSupplies(state);
            foodResult.textContent = result.foodGrams > 0 ? formatAmount(result.foodGrams, 'g') : '1日量を入力';
            waterResult.textContent = result.waterMilliliters > 0 ? formatAmount(result.waterMilliliters, 'mL') : '1日量を入力';
            foodFormula.textContent = result.foodGrams > 0 ? `${state.dailyFood.toLocaleString()}g × ${result.days}日` : 'パッケージや獣医師の指示にある「いつもの1日量」を入力してください。';
            waterFormula.textContent = result.waterMilliliters > 0 ? `${state.dailyWater.toLocaleString()}mL × ${result.days}日` : '普段の飲水量を目安に入力してください。体調に不安がある場合は獣医師へ相談してください。';
        }

        function formatAmount(amount, unit) {
            if (amount >= 1000) {
                const converted = Math.round((amount / 1000) * 10) / 10;
                return `${converted.toLocaleString()}${unit === 'g' ? 'kg' : 'L'}`;
            }
            return `${amount.toLocaleString()}${unit}`;
        }

        function renderChecklist() {
            const items = createChecklist(state.species);
            checklist.replaceChildren();
            items.forEach(([id, label, note]) => {
                const row = document.createElement('label');
                row.className = 'check-row';
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.checked = state.checks[id] === true;
                input.addEventListener('change', () => {
                    state.checks[id] = input.checked;
                    save();
                    renderProgress();
                    renderPrintable();
                });
                const body = document.createElement('span');
                const strong = document.createElement('strong');
                strong.textContent = label;
                const small = document.createElement('small');
                small.textContent = note;
                body.append(strong, small);
                row.append(input, body);
                checklist.appendChild(row);
            });
        }

        function renderProgress() {
            const total = createChecklist(state.species).length;
            const done = completedCount(state);
            progressText.textContent = `${done} / ${total} 項目を確認`;
            progressBar.style.width = `${Math.round((done / total) * 100)}%`;
        }

        function renderPrintable() {
            const result = calculateSupplies(state);
            printable.replaceChildren();

            const title = document.createElement('h2');
            title.textContent = `${state.petName || 'うちの子'}の同行避難プラン`;
            const summary = document.createElement('p');
            summary.textContent = `${state.species === 'cat' ? '猫' : '犬'}・備蓄 ${state.days}日分`;
            printable.append(title, summary);

            appendPrintGroup('飼い主・連絡先', [
                ['飼い主', state.ownerName],
                ['電話', state.ownerPhone],
                ['動物病院', state.veterinarian],
                ['病院の電話', state.veterinarianPhone],
                ['緊急連絡先', state.emergencyContact],
                ['マイクロチップ番号', state.microchip]
            ]);
            appendPrintGroup('避難計画', [
                ['第1候補', state.primaryShelter],
                ['第2候補', state.backupShelter],
                ['集合場所', state.meetingPlace],
                ['ルート・注意点', state.routeNotes]
            ]);
            appendPrintGroup('持ち出し量', [
                ['フード', result.foodGrams ? formatAmount(result.foodGrams, 'g') : '未入力'],
                ['水', result.waterMilliliters ? formatAmount(result.waterMilliliters, 'mL') : '未入力'],
                ['薬・療法食', state.medication]
            ]);

            const listTitle = document.createElement('h3');
            listTitle.textContent = '準備チェック';
            const list = document.createElement('ul');
            createChecklist(state.species).forEach(([id, label]) => {
                const item = document.createElement('li');
                item.textContent = `${state.checks[id] ? '☑' : '□'} ${label}`;
                list.appendChild(item);
            });
            printable.append(listTitle, list);
        }

        function appendPrintGroup(titleText, entries) {
            const heading = document.createElement('h3');
            heading.textContent = titleText;
            const list = document.createElement('dl');
            entries.forEach(([label, value]) => {
                const dt = document.createElement('dt');
                const dd = document.createElement('dd');
                dt.textContent = label;
                dd.textContent = value || '未記入';
                list.append(dt, dd);
            });
            printable.append(heading, list);
        }

        function render() {
            renderSupplies();
            renderChecklist();
            renderProgress();
            renderPrintable();
            if (root.lucide) root.lucide.createIcons();
        }

        fields.forEach((field) => {
            field.addEventListener('input', () => readField(field));
            field.addEventListener('change', () => readField(field));
        });

        document.getElementById('print-plan').addEventListener('click', () => window.print());
        document.getElementById('reset-plan').addEventListener('click', () => {
            if (!window.confirm('入力内容とチェック状態をすべて消去しますか？')) return;
            state = normalizeState({});
            save();
            restoreFields();
            render();
        });

        restoreFields();
        render();
    }

    const api = { DEFAULT_STATE, calculateSupplies, createChecklist, normalizeState };
    root.PetDisasterPlanner = api;

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
        else init();
    }
})(typeof globalThis !== 'undefined' ? globalThis : this);
