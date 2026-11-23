/* Read-only presentation metadata. Never changes IDs, values, CSVs or write permissions. */
'use strict';
(() => {
  const fields = Object.create(null);
  const add = (keys, title, stat, summary, effect) => keys.split(' ').forEach(key => { fields[key.toLowerCase()]={title,stat,summary,effect}; });
  add('maxHealth', '최대 체력', '생존 · 최대 체력', '대상이 가질 수 있는 체력의 기준 상한입니다.', '높이면 기본 체력 상한이 커집니다. 현재 체력이나 기존 세이브를 즉시 회복시키지는 않습니다.');
  add('maxStamina', '최대 스태미너', '이동 · 스태미너', '질주·회피 등에 사용하는 스태미너의 기준 상한입니다.', '높이면 기본 스태미너 저장량이 커집니다. 회복 속도와 소모량은 별도 항목입니다.');
  add('maxHunger maxThirst', '생존 자원 상한', '생존 · 에너지/수분', '해당 에너지 또는 수분 자원의 최대 저장량입니다.', '높이면 해당 자원의 상한이 커집니다. 시간당 소모율은 별도로 확인하세요.');
  add('damage', '기본 피해량', '전투 · 공격 피해', '해당 무기·공격의 피해 계산에 들어가는 기본값입니다.', '높이면 같은 조건의 기본 피해가 커집니다. 방어구·부위·탄약·적 전용 배율에 따라 최종 피해는 달라집니다.');
  add('headMultiplier', '머리 피해 배율', '전투 · 머리 명중 피해', '머리 명중 시 기본 피해에 적용하는 배율입니다.', '높이면 같은 공격의 머리 명중 피해가 커집니다. 기본 피해량 자체와는 별도입니다.');
  add('damageMultiplier', '공격 피해 배율', '전투 · 피해 보정', '이 규칙을 사용하는 공격의 피해 보정 배율입니다.', '높이면 해당 공격의 피해가 커집니다. 공용 무기와 적 전용 규칙의 적용 대상을 구별하세요.');
  add('range', '사거리', '전투 · 공격 도달 범위', '해당 무기·공격의 사거리 기준입니다.', '높이면 공격이 도달할 수 있는 범위가 늘어납니다. 적의 인식 거리는 별도입니다.');
  add('fireInterval burstInterval', '발사 사이 간격', '전투 · 발사 속도', '발사 사이에 기다리는 시간입니다.', '높이면 연속 발사가 느려지고, 낮추면 빨라집니다. 0으로 바꾸지 마세요.');
  add('reloadTime', '재장전 시간', '전투 · 재장전', '해당 무기의 재장전에 걸리는 기준 시간입니다.', '높이면 재장전이 오래 걸립니다. 부상 등의 장전 배율이 추가될 수 있습니다.');
  add('magazineSize', '탄창 용량', '무기 · 장전 가능한 탄수', '해당 무기의 탄창에 넣을 수 있는 기본 탄수입니다.', '높이면 탄창 용량이 커집니다. 보유 예비 탄약량과는 다릅니다.');
  add('ammoPerShot', '발사당 탄약 소모', '무기 · 탄약 소비', '한 번 발사할 때 소비하는 탄약 수입니다.', '높이면 한 발사에 더 많은 탄약을 소비합니다. 피해가 같은 비율로 증가하는 값은 아닙니다.');
  add('spreadDegrees aimSpread hipSpread', '탄퍼짐', '명중 · 탄퍼짐', '조준 방향에서 탄이 퍼지는 범위의 기준입니다.', '높이면 탄이 더 넓게 퍼져 같은 조준 조건의 집탄성이 낮아집니다.');
  add('recoilPitch recoilYaw', '반동', '조작 · 반동', '발사 시 수직 또는 수평 방향 반동의 크기입니다.', '높이면 해당 방향 반동이 커집니다. 탄퍼짐과는 별도 항목입니다.');
  add('pelletCount', '발사체 수', '무기 · 산탄/발사체', '한 번 공격할 때 생성하는 발사체 수입니다.', '높이면 발사체 수가 늘어납니다. 발사체별 피해와 탄약 소모를 함께 확인하세요.');
  add('automatic', '자동 사격 여부', '무기 · 입력 방식', '사격 입력을 유지할 때 연속 사격하는지 정합니다.', '켜짐/꺼짐에 따라 입력 처리 방식이 달라집니다. 발사 간격은 별도입니다.');
  add('usesAmmo', '탄약 사용 여부', '무기 · 탄약 조건', '공격에 탄약을 사용하는지 정합니다.', '탄약 종류·장전·발사 조건과 함께 확인해야 합니다.');
  add('inventoryWeight weight', '무게', '장비 · 하중', '해당 물품의 무게 또는 코드에 정의된 가중치입니다.', '아이템 무게라면 소지 하중에 영향을 줍니다. 코드의 선택 가중치는 kg가 아니므로 단위와 사용 범위를 확인하세요.');
  add('inventoryWidth inventoryHeight', '인벤토리 점유 크기', '보관 · 격자 점유', '아이템이 인벤토리 격자에서 차지하는 너비 또는 높이입니다.', '높이면 해당 방향의 점유 칸이 늘어납니다. 전체 가방 크기와 구별하세요.');
  add('maxStack', '최대 중첩 수', '보관 · 아이템 중첩', '한 묶음으로 보관할 수 있는 수량의 상한입니다.', '높이면 같은 묶음에 더 많이 보관할 수 있습니다. 기존 저장된 묶음의 자동 재정렬은 별도입니다.');
  add('maxCharges maxCapacity', '사용량/보관량 상한', '아이템 · 용량', '해당 아이템의 사용 횟수 또는 내부 용량의 상한입니다.', '높이면 해당 용량이 커집니다. 아이템 종류에 따라 소비 방식이 다릅니다.');
  add('shopBuyPrice buyPrice', '구매 가격', '거래 · 지출', '대상을 구매할 때 사용하는 가격입니다.', '높이면 구매 비용이 커집니다. 판매 가격과는 별도입니다.');
  add('shopSellPrice sellPrice', '판매 가격', '거래 · 수입', '대상을 판매할 때 사용하는 가격입니다.', '높이면 판매로 받는 가격이 커집니다. 가격 제한·배율이 추가될 수 있습니다.');
  add('healthRecovery staminaRecovery thirstRecovery hungerRecovery', '자원 회복량/속도', '생존 · 회복', '이 항목에 해당하는 체력·스태미너·수분·에너지의 회복 기준입니다.', '높이면 해당 자원의 회복량 또는 회복 속도가 커집니다. 소모품의 1회 회복량과 지속 회복 규칙을 구별하세요.');
  add('useDuration', '사용 시간', '아이템 · 사용 동작', '소모품을 사용하는 데 걸리는 기준 시간입니다.', '높이면 사용 완료까지 더 오래 걸립니다. 즉시 회복량 자체를 늘리지는 않습니다.');
  add('walkSpeed sprintSpeed patrolSpeed chaseSpeed', '이동 속도', '이동 · 속도', '보행·질주·순찰·추격 중 해당 상태의 이동 속도 기준입니다.', '높이면 해당 상태에서 더 빠르게 이동합니다. 다른 상태의 속도와 별개입니다.');
  add('sprintDrain rollCostFraction', '이동 자원 소모', '이동 · 스태미너 소비', '질주 또는 회피에서 사용하는 스태미너 소모 기준입니다.', '높이면 해당 동작의 스태미너 부담이 커집니다. 시간당 소모인지 최대치 비율인지 단위를 확인하세요.');
  add('detection', '표적 인식 거리', '적 AI · 표적 발견', '적이 표적을 발견할 때 사용하는 인식 거리 기준입니다.', '높이면 더 먼 표적이 인식 후보가 됩니다. 시야각·가림·진영 조건은 별도로 적용됩니다.');
  add('fieldOfView', '시야각', '시야 · 인식 각도', '시야 또는 카메라의 각도 범위입니다.', '높이면 각도 범위가 넓어집니다. 적 인식용인지 카메라용인지 영향 대상을 확인하세요.');
  add('loseRadius', '표적 유지 거리', '적 AI · 추적 해제', '추적하던 표적을 잃는 거리 판정에 쓰는 범위입니다.', '높이면 멀어진 표적을 더 오래 유지할 수 있습니다. 최초 발견 거리와 구별하세요.');
  add('reaction aimTime', '반응/조준 대기', '적 AI · 행동 시작', '반응하거나 조준을 마칠 때까지 기다리는 시간 기준입니다.', '높이면 해당 행동이 시작되기까지 더 오래 기다립니다.');
  add('expectedTargetHealth', '표적 예상 최대 체력', '적 AI · 플레이어 체력 추정', '적이 관측 피해를 체력 비율로 환산할 때 쓰는 예상 체력입니다.', '높이면 같은 관측 피해로 계산되는 체력 감소 비율이 작아집니다. 플레이어 실제 최대 체력은 바뀌지 않습니다.');
  add('lowHealthThreshold resumeHealthThreshold', '체력 행동 전환 문턱', '적 AI · 회복/전투 전환', '자신의 체력 비율에 따라 회복·전투 상태를 전환하는 기준입니다.', '낮은 체력 문턱과 전투 복귀 문턱의 순서를 유지하세요. 두 값은 같은 의미가 아닙니다.');
  add('minRange maxRange preferredRange', '교전 거리 기준', '적 AI · 교전 위치', '최소·최대·선호 교전 거리 중 해당 기준입니다.', '서로의 대소 관계를 유지하세요. 적의 발견 거리나 무기의 사거리와는 별도입니다.');
  add('duration cooldown delay interval recoveryDelay rollCooldown rollDuration', '시간 기준', '동작 · 지속/대기 시간', '해당 기능의 지속 시간 또는 다음 동작까지의 대기 기준입니다.', '높이면 해당 시간 구간이 길어집니다. 효과량 자체와는 다릅니다.');
  add('defaultDropMinQuantity defaultDropMaxQuantity', '드롭 수량 범위', '파밍 · 획득 수량', '기본 드롭 수량의 최소 또는 최대 범위를 정합니다.', '최솟값이 최댓값을 넘지 않도록 조정하세요.');
  add('displayName name label description', '표시 문구', '표시 · 이름/설명', '해당 대상의 표시 이름 또는 설명 텍스트입니다.', '텍스트를 바꾸며 전투 수치를 직접 변경하지 않습니다.');
  // Common editable catalog fields; keep unrelated code literals on the conservative fallback.
  add('stackable', '중첩 가능 여부', '보관 · 묶음 허용', '같은 아이템을 한 묶음으로 합칠 수 있는지 정합니다.', '중첩을 허용해도 한 묶음의 수량은 최대 중첩 수의 제한을 받습니다.');
  add('quickSlotAllowed', '퀵슬롯 등록 허용', '조작 · 빠른 사용', '아이템의 퀵슬롯 등록 허용 여부입니다.', '허용하면 퀵슬롯 등록 후보가 됩니다. 아이템 사용 가능 여부는 별도 규칙입니다.');
  add('shopTradable', '상점 거래 허용', '거래 · 판매 가능 여부', '해당 아이템의 상점 거래 허용 여부입니다.', '판매 가능 판정에 영향을 줍니다. 이 값만으로 상점 판매 목록에 상품이 추가되지는 않습니다.');
  add('useEnabled', '아이템 사용 허용', '아이템 · 사용 가능 여부', '해당 아이템의 사용 기능을 허용하는지 정합니다.', '꺼져 있으면 이 사용 설정으로 아이템을 사용할 수 없습니다.');
  add('meleeDelay', '근접 공격 판정 지연', '근접 전투 · 타격 시점', '근접 공격을 시작한 뒤 타격 판정까지 기다리는 시간입니다.', '높이면 공격 시작 후 실제 타격이 더 늦게 발생합니다.');
  add('legacyMagazineSize', '이전 탄창 크기 호환 기준', '저장 호환 · 탄창 복원', '기존 저장 무기를 복원할 때 허용할 탄창 크기 판단에 사용됩니다.', '현재 탄창 용량 튜닝과 구별하세요. 기존 저장 데이터의 복원 허용 범위에 영향을 줍니다.');
  add('reserve', '예비 탄약 보유량', '적 무기 · 탄약 보급', '해당 적 무기의 예비 탄약 설정입니다.', '높이면 해당 무기의 예비 탄약 기준이 늘어납니다. 탄창 용량과 구별하세요.');
  add('armorPenetrationPower', '방어구 관통력', '전투 · 방어구 관통', '탄약이 방어구를 관통하는 계산에 사용하는 값입니다.', '높이면 같은 방어구에 대한 관통 성능이 커집니다. 체력 피해 배율과는 별도입니다.');
  add('maxDurability', '최대 내구도', '방어구 · 내구도', '새 방어구의 내구도와 최대 내구도 기준입니다.', '높이면 새 방어구의 내구도 기준이 커집니다. 기존 저장 방어구의 마모 상태와 구별하세요.');
  add('movementMultiplier', '장비 이동 속도 배율', '이동 · 장비 무게 부담', '장비 착용 시 이동 속도에 적용하는 배율입니다.', '1에 가까울수록 이동 감속이 작습니다. 기본 이동 속도와 함께 계산됩니다.');
  add('aimSpeedMultiplier', '조준 진입 속도 배율', '조작 · 조준 진입 지연', '장비 착용 시 조준 진입 지연 계산에 사용하는 배율입니다.', '1에 가까울수록 장비로 인한 조준 진입 지연이 줄어듭니다. 탄퍼짐을 직접 줄이지는 않습니다.');
  add('repairable', '수리 허용 여부', '방어구 · 수리 가능 여부', '해당 방어구가 수리 가능한 종류인지 정합니다.', '허용해도 마모 한계·수리 키트·비용 조건이 별도로 적용됩니다.');
  add('hideHead', '착용 시 머리 표시 규칙', '외형 · 머리 숨김', '장비 착용 시 머리 표시 처리에 전달하는 설정입니다.', '캐릭터 외형 표시용입니다. 방어력이나 머리 부위 체력 수치가 아닙니다.');
  add('moveSpeedMultiplier', '사용 중 이동 속도 배율', '아이템 사용 · 이동 제한', '아이템 사용 중 이동 속도에 적용하는 배율입니다.', '높이면 사용 중 이동 감속이 줄어듭니다. 평상시 기본 속도와는 별도입니다.');
  add('maxUseDuration', '연속 사용 최대 시간', '아이템 사용 · 시간 제한', '지속 사용 작업에 설정된 최대 사용 시간입니다.', '높이면 한 번의 사용을 더 오래 지속할 수 있습니다. 자원 소진 등으로 먼저 끝날 수 있습니다.');
  add('interruptOnDamage', '피격 시 사용 중단', '아이템 사용 · 취소 조건', '직접 피해를 받았을 때 아이템 사용을 중단하는지 정합니다.', '켜면 피격이 사용 취소 조건이 됩니다. 피해량 자체를 바꾸지는 않습니다.');
  add('repairRate', '초당 수리 용량 소비', '수리 · 진행 속도', '수리 중 초당 소비할 키트 용량의 기준입니다.', '높이면 같은 시간에 더 많은 수리 용량을 사용합니다. 실제 내구도 회복은 수리 효율도 함께 적용합니다.');
  add('repairPerCapacity', '용량당 수리 효율', '수리 · 내구도 회복 효율', '키트 용량을 내구도 회복으로 환산하는 효율 계수입니다.', '높이면 같은 용량으로 회복할 수 있는 내구도가 커집니다. 방어구 효율·등급 호환성도 함께 계산합니다.');
  add('wearMultiplier', '수리 마모 배율', '수리 · 최대 내구도 손실', '수리 계산에서 최대 내구도 마모에 사용하는 배율입니다.', '높이면 수리 시 마모 부담이 커집니다. 현재 내구도 회복량과 구별하세요.');
  add('healPerSecond', '초당 체력 회복', '의료 · 지속 회복 속도', '지속 치료 중 초당 회복할 체력의 기준입니다.', '높이면 더 빠르게 체력을 회복합니다. 의료 용량과 유효 최대 체력의 제한을 받습니다.');
  add('effectDuration analgesicDuration', '효과 지속 시간', '의료 · 효과 유지', '진통 등 해당 효과가 지속되는 시간입니다.', '높이면 효과 유지 시간이 길어집니다. 사용 동작 시간이나 즉시 회복량과 구별하세요.');
  add('bleedCapacityCost', '지혈 용량 소비', '의료 · 지혈 비용', '전술 의료 아이템으로 지혈할 때 필요한 용량입니다.', '높이면 한 번의 지혈에 필요한 의료 용량이 늘어납니다.');
  add('analgesicCapacityCost', '진통 용량 소비', '의료 · 진통 비용', '전술 의료 아이템으로 진통 효과를 사용할 때 필요한 용량입니다.', '높이면 한 번의 진통 사용에 필요한 의료 용량이 늘어납니다.');
  add('rollProtectionTail', '회피 후 추가 보호 시간', '생존 · 회피 보호', '회피 동작 시간에 더해지는 보호 시간입니다.', '높이면 회피 뒤 보호 시간이 더 길어집니다. 회피 거리와 재사용 대기 시간은 별도입니다.');
  add('starvationDamage', '굶주림 피해량', '생존 · 에너지 고갈 피해', '에너지가 고갈된 동안 주기적으로 받는 피해량입니다.', '높이면 한 번의 고갈 피해가 커집니다. 피해 간격은 별도입니다.');
  add('starvationInterval', '굶주림 피해 간격', '생존 · 고갈 피해 주기', '에너지 고갈 피해가 발생하는 시간 간격입니다.', '높이면 피해 주기가 길어집니다. 0보다 큰 값을 유지해야 합니다.');
  add('overweightSpeed', '과적 이동 배율', '이동 · 과적 감속', '중량 비율이 1을 초과할 때 이동 속도에 곱하는 배율입니다.', '높이면 과적으로 인한 감속이 줄어듭니다. 이동·질주 금지 문턱은 별도입니다.');
  add('weightNeedsMultiplier', '과적 생존 자원 소모 계수', '생존 · 과적 소모 가중', '중량 비율 1을 초과한 정도에 곱해 에너지·수분 소모를 늘리는 계수입니다.', '높이면 과적 상태의 생존 자원 소모가 더 빠르게 커집니다. 최대 소모 배율의 제한을 받습니다.');
  add('maximumNeedsMultiplier', '생존 자원 소모 배율 상한', '생존 · 소모 배율 제한', '중량으로 증가한 에너지·수분 소모 배율의 상한입니다.', '높이면 과적 시 허용되는 소모 배율의 최대치가 커집니다.');
  for(const [key,title,stat] of [['maxHunger','최대 에너지','생존 · 에너지 상한'],['maxThirst','최대 수분','생존 · 수분 상한']])add(key,title,stat,'해당 생존 자원의 최대 저장량입니다.','높이면 해당 자원의 상한이 커집니다. 시간당 소모량은 별도입니다.');
  for(const [prefix,title] of [['hunger','에너지'],['thirst','수분']])for(const [suffix,state] of [['Idle','정지'],['Walk','보행'],['Sprint','질주']])add(prefix+suffix,state+' 중 '+title+' 소모','생존 · '+title+' 소모','출격 중 '+state+' 상태에서 초당 소비하는 '+title+'의 기준입니다.','높이면 해당 상태의 소모가 빨라집니다. 과적 소모 배율이 추가될 수 있습니다.');
  for(const [key,title] of [['healthRecovery','체력'],['staminaRecovery','스태미너'],['hungerRecovery','에너지'],['thirstRecovery','수분']])add(key,title+' 회복 기준','생존 · '+title+' 회복','해당 자원의 회복량 또는 회복 속도 기준입니다.','높이면 '+title+' 회복이 커집니다. 소모품의 1회 회복량과 플레이어의 초당 회복 규칙은 원본에 따라 다릅니다.');
  const scopedFields=[
    [/PlayerDefaults|PlayerSettings/, 'worldscale', '월드 거리 환산 배율', '공간 · 거리/속도 환산', '프로토타입 거리·속도를 Unity 월드 크기로 환산합니다.', '이동·시야·카메라 등 여러 거리 계산에 함께 영향을 줍니다.'],
    [/PlayerDefaults|PlayerSettings/, 'rolldistance', '회피 이동 거리', '이동 · 회피 거리', '한 번의 회피에서 이동할 총거리 기준입니다.', '높이면 회피 거리가 길어집니다. 월드 배율과 충돌 제한이 적용됩니다.'],
    [/PlayerDefaults|PlayerSettings/, 'sprintangle', '전방 질주 허용 각도', '이동 · 질주 방향 조건', '전방 방향과의 각도로 질주 허용 여부를 판정합니다.', '높이면 전방에서 더 벗어난 이동 방향에도 질주를 허용합니다.'],
    [/PlayerDefaults|PlayerSettings/, 'minimumaimdistance', '최소 조준 방향 거리', '조작 · 조준 방향 판정', '조준 지점이 너무 가까울 때 방향 계산을 제한하는 거리입니다.', '높이면 가까운 지점을 조준 방향으로 인정하지 않는 범위가 커집니다.'],
    [/PlayerDefaults|PlayerSettings/, 'cameradistance', '카메라 궤도 거리', '카메라 · 시점 위치', '플레이어 기준 카메라 궤도 오프셋의 거리입니다.', '높이면 궤도 방향으로 더 멀리 위치합니다. 높이·피치·월드 배율도 적용됩니다.'],
    [/PlayerDefaults|PlayerSettings/, 'cameraheight', '카메라 높이 오프셋', '카메라 · 시점 높이', '카메라 위치에 추가하는 수직 오프셋입니다.', '높이면 시점의 수직 위치가 올라갑니다. 월드 배율이 적용됩니다.'],
    [/PlayerDefaults|PlayerSettings/, 'camerayaw', '카메라 수평 궤도 각도', '카메라 · 수평 방향', '카메라 오프셋을 회전하는 수평 각도입니다.', '각도에 따라 카메라의 수평 위치가 달라집니다.'],
    [/PlayerDefaults|PlayerSettings/, 'camerapitch', '카메라 수직 궤도 각도', '카메라 · 수직 방향', '카메라 오프셋을 회전하는 수직 각도입니다.', '각도에 따라 카메라의 수직 궤도 위치가 달라집니다.'],
    [/PlayerDefaults|PlayerSettings/, 'camerasmoothness', '카메라 추종 반응 계수', '카메라 · 위치 추종', '카메라 위치가 목표로 따라가는 보간 계수입니다.', '높이면 목표 위치를 더 빠르게 따라갑니다.'],
    [/PlayerDefaults|PlayerSettings/, 'looksmoothness', '시선 오프셋 추종 계수', '카메라 · 시선 추종', '시선 오프셋이 목표로 따라가는 보간 계수입니다.', '높이면 시선 오프셋이 더 빠르게 반응합니다.'],
    [/PlayerDefaults|PlayerSettings/, 'lookahead', '시선 앞보기 거리', '카메라 · 조준 방향 오프셋', '조준 방향으로 카메라 중심을 이동시키는 거리 기준입니다.', '높이면 조준 방향으로 더 멀리 이동할 수 있습니다. 별도 재정의가 우선할 수 있습니다.'],
    [/PlayerDefaults|PlayerSettings/, 'mousedeadzone', '시선 이동 입력 유예 범위', '카메라 · 마우스 반응', '화면 중심 부근에서 시선 반응을 억제하는 입력 구간입니다.', '높이면 화면 중심 근처의 마우스 이동에 카메라가 덜 반응합니다.'],
    [/PlayerDefaults|PlayerSettings/, 'maxscreenoffset.x', '화면 중심 가로 이탈 한계', '카메라 · 화면 위치', '화면 중심에서 플레이어가 벗어날 수 있는 가로 범위입니다.', '높이면 가로 허용 이탈 범위가 늘어납니다. 화면 여백 제한도 적용됩니다.'],
    [/PlayerDefaults|PlayerSettings/, 'maxscreenoffset.y', '화면 중심 세로 이탈 한계', '카메라 · 화면 위치', '화면 중심에서 플레이어가 벗어날 수 있는 세로 범위입니다.', '높이면 세로 허용 이탈 범위가 늘어납니다. 화면 여백 제한도 적용됩니다.'],
    [/PlayerDefaults|PlayerSettings/, 'screenmargin', '화면 가장자리 여백', '카메라 · 화면 경계', '플레이어를 화면 안에 유지하는 경계 여백입니다.', '높이면 가장자리 여백이 커집니다. 중심 이탈 한계와 함께 판정합니다.'],
    [/PlayerDefaults|PlayerSettings/, 'collisionpadding', '이동 충돌 여유 거리', '이동 · 장애물 여유', '이동 충돌 검사에서 장애물과 떨어뜨리는 여유 거리입니다.', '높이면 장애물 앞에서 더 멀리 멈출 수 있습니다.'],
    [/PlayerDefaults|PlayerSettings/, 'visionfieldofview', '플레이어 시야 각도', '시야 · 전방 가시 범위', '플레이어의 전방 시야 부채꼴 각도입니다.', '높이면 보이는 각도 범위가 넓어집니다. 카메라 렌즈 시야각과 구별하세요.'],
    [/PlayerDefaults|PlayerSettings/, 'closevisionradius', '근접 시야 반경', '시야 · 근거리 가시 범위', '플레이어 가까운 주변을 드러내는 시야 반경입니다.', '높이면 가까운 주변을 더 넓게 볼 수 있습니다. 적 AI의 발견 거리와는 다릅니다.'],
    [/PlayerDefaults|PlayerSettings/, 'closevisionfeather', '근접 시야 경계 전환 폭', '시야 · 경계 표현', '근접 시야 경계가 부드럽게 전환되는 폭입니다.', '높이면 경계 전환 폭이 커집니다. 공격 능력치가 아닙니다.'],
    [/PlayerDefaults|PlayerSettings/, 'visiondarkness', '시야 밖 어두움', '시야 · 가림 표현', '플레이어 시야 밖 영역의 어두움 표현 기준입니다.', '시야 밖 표현을 바꾸며 피해량이나 적 체력을 바꾸지 않습니다.'],
    [/ShopCatalog/, 'limit', '출격당 구매 제한', '거래 · 구매 수량 제한', '해당 상품을 한 출격 주기에서 구매할 수 있는 수량입니다.', '높이면 구매 가능 수량이 늘어납니다. 탄약 등 무제한 상품은 별도 규칙을 사용합니다.'],
    [/ShopCatalog/, 'enabled', '상점 상품 활성화', '거래 · 판매 목록', '상점 판매 목록에 노출할 상품인지 정합니다.', '켜짐이어도 진행 조건·재고·구매 비용을 충족해야 구매할 수 있습니다.'],
    [/ShopCatalog/, 'order', '상점 표시 순서', '표시 · 상품 정렬', '상점에서 상품을 나열하는 정렬 기준입니다.', '수치 순서에 따라 표시 위치가 달라집니다. 가격·재고·성능 수치를 바꾸지 않습니다.'],
    [/AmmoCatalog|AmmoRules/, 'tier', '탄약 등급', '탄약 · 등급 정보', '탄약의 등급 표기와 분류 정보입니다.', '피해 배율과 관통력은 별도 필드입니다. 등급만 바꿔도 그 두 값이 함께 바뀐다고 가정하지 마세요.'],
    [/WeaponCatalog|RifleState/, 'aimassistradius', '조준 보조 반경 선언값', '무기 · 사용 연결 확인 필요', '무기 정의에 남아 있는 조준 보조 반경 필드입니다.', '현재 확인한 실행 코드에서 이 필드의 소비 지점을 찾지 못했습니다. 실제 조준 보조가 바뀐다고 확정할 수 없습니다.']
  ];
  const domains=[[/EnemyTargetPerception/,'적 AI · 플레이어 상태 추정'],[/EnemyBrain|EnemyController|EnemyTarget|EnemyWeapon|MachineAttack|PlayerNoise/,'적 AI · 인식과 전투'],[/PlayerDefaults|PlayerRules|PlayerSettings/,'플레이어 · 기본 능력'],[/PlayerMotor/,'플레이어 · 이동'],[/WeaponCatalog|AmmoCatalog|Rifle|AmmoRules|Weapon|Melee|\/(?:AR|P|SG|SR|KN|SMG|MG|DMR)_\d+\.asset/,'무기·탄약'],[/Injury|Infection|ItemUse/,'생존 · 부상/의료'],[/Damage|Hitscan|Combat|Hitbox/,'전투 · 피해 계산'],[/Shop|Transactions|RepairCalculator|ItemValueTier/,'거래·경제'],[/Loot/,'파밍·전리품'],[/Research|Growth|Quest/,'성장·퀘스트'],[/Companion|ProfileChip/,'동료·칩'],[/Inventory|ItemCatalog|PrototypeItems|Armor|Backpack|GameDefinitions/,'아이템·장비·보관'],[/Encounter|Stage|Session|Extraction/,'출격·맵 진행'],[/Profile|Save/,'세이브·프로필']];
  const domain = (row,dataset) => domains.find(([rx])=>rx.test(row.source||''))?.[1] || dataset?.group || row._datasetLabel || '연결 데이터';
  function perception(row) {
    if(!/\/EnemyTargetPerception\.cs$/.test(row.source||''))return null;
    const n=row.note||'',o=Number(row.id?.match(/:(\d+)$/)?.[1]||0);
    const make=(title,stat,role,summary,effect,context)=>({title,stat,role,summary,effect,context,target:'적 AI · 플레이어 상태 추정',certainty:'코드 확인',caution:'플레이어의 실제 체력·최대 체력을 바꾸지 않습니다. 적이 관측한 정보로 만든 추정입니다.'});
    if(/private float estimatedHealthFraction\s*=/.test(n))return make('추정 체력 비율의 초기값','적의 표적 체력 추정','초기값','새 적의 관측 기억을 만들 때 플레이어 체력이 얼마나 남았다고 가정할지 정합니다.','1은 100%가 남았다는 추정입니다. 높이면 첫 관측 전 표적이 더 건강하다고 가정합니다.','관측 기억 생성 → EnemyController → EnemyBrain의 약한 표적 판단');
    if(/private float confidence\s*=/.test(n))return make('체력 추정 확신도의 초기값','적의 판단 확신도','초기값','플레이어 상태에 관한 관측이 없을 때의 추정 확신도입니다.','높이면 처음부터 자신의 체력 추정을 더 믿습니다. 명중률이나 실제 피해량을 직접 바꾸지는 않습니다.','관측 기억 생성 → TargetHealthConfidence → 약한 표적 판단');
    if(/lastEvidenceAt\s*=\s*-/.test(n))return make('아직 관측하지 않은 시각 표시','관측 기억 · 시간 순서','미관측 표시','피해·치료를 아직 관측하지 않았음을 나타내는 시각 초기값입니다.','초기 표식이며 적의 반응 시간·관측 주기가 아닙니다. 시간 순서 검증과 연결되므로 임의 튜닝을 피하세요.','생성 시 초기화 → ObserveDamage/ObserveTreatment의 관측 시각 비교');
    if(/estimatedHealthFraction\s*=\s*Math.Max\(0,/.test(n))return make('피해 관측 후 추정 체력의 최솟값','적의 표적 체력 추정','하한값','명중 피해를 예상 체력으로 나눠 빼고, 이 값보다 낮아지지 않게 제한합니다.','높이면 적이 추정하는 남은 체력이 그 값 아래로 내려가지 않습니다. 플레이어를 회복시키는 값은 아닙니다.','ObserveDamage → EstimatedHealthFraction');
    if(/confidence\s*=\s*Math.Min\(/.test(n)) {
      if(o===1)return make('피해 관측 확신도의 상한','적의 판단 확신도','상한값','피해를 여러 번 관측해도 확신도가 이 값을 넘지 않도록 제한합니다.','높이면 피해 관측 후 도달 가능한 확신도가 커집니다.','ObserveDamage → Confidence');
      if(o===2)return make('명중 관측당 확신도 증가','적의 판단 확신도','증가량','피해를 관측할 때 확신도에 더하는 고정 증가량입니다.','높이면 한 번의 명중 관측으로 얻는 확신도가 더 커집니다.','ObserveDamage → 고정 증가 + 피해 비율 보정 → 상한 제한');
      if(o===3)return make('관측 피해 비율의 확신도 가중치','적의 판단 확신도','계산 계수','관측 피해 ÷ 예상 체력에 곱해 확신도에 더하는 가중치입니다.','높이면 큰 피해를 관측했을 때 확신도가 더 빠르게 오릅니다. 실제 피해 배율이 아닙니다.','ObserveDamage → appliedDamage / expectedHealth × 가중치');
    }
    if(/estimatedHealthFraction\s*=\s*Math.Max\(estimatedHealthFraction,/.test(n))return make('치료 관측 후 추정 체력의 최저 가정','적의 표적 체력 추정','치료 관측 하한','치료 동작을 본 적은 표적 체력을 최소 이 비율만큼 남았다고 다시 가정합니다.','높이면 치료 목격 후 표적이 더 건강해졌다고 추정합니다. 실제 치료량·사용 아이템 수치를 읽는 값이 아닙니다.','ObserveTreatment → EstimatedHealthFraction');
    if(/confidence\s*=\s*Math.Max\(/.test(n)) {
      if(o===1)return make('치료 관측 후 확신도의 하한','적의 판단 확신도','하한값','치료 목격으로 확신도를 낮추되 이 값 미만으로 내려가지 않게 합니다.','높이면 치료 관측 이후에도 일정 수준의 확신을 유지합니다.','ObserveTreatment → Confidence');
      if(o===2)return make('치료 관측 후 기존 확신도 유지 비율','적의 판단 확신도','곱셈 계수','치료 목격 후 이전 체력 추정이 불확실해져 기존 확신도에 이 비율을 곱합니다.','높이면 기존 확신도를 더 많이 유지합니다. 낮추면 확신이 더 크게 감소합니다.','ObserveTreatment → confidence × 유지 비율 → 하한 제한');
    }
    return null;
  }
  function describe(row,dataset={}) {
    const specific=perception(row);if(specific)return specific;
    if(row.source==='Assets/Escape/Runtime/Companions/CompanionAbilityController.cs'&&row.field==='spread'&&/:4$/.test(row.id||'')&&row.note?.replace(/\s/g,'').startsWith('if(State.UltimateRemaining>0)spread=choices[2]==0?')&&!(row.value===75&&row.note==='if(State.UltimateRemaining>0)spread=choices[2]==0?.75f:.65f;'))return {title:'정찰 필살기 탄퍼짐 배율',stat:'동료 · 표식 조준 집탄',target:'정찰형 동료 · 필살기·표식 조준',role:'효과 배율',certainty:'코드 확인',summary:'필살기 활성 중 표식을 조준하고 마지막 훈련 특성의 첫 분기를 선택했을 때 적용하는 탄퍼짐 배율입니다.',effect:'0.75는 보정 전 탄퍼짐의 75%입니다. 낮추면 탄퍼짐이 더 줄고, 높이면 집탄 보너스가 약해집니다. 체력이나 피해 배율이 아닙니다.',caution:'소수점 읽기를 수정해 화면·CSV·원본 반영에서 같은 숫자를 사용합니다. 이전 오류 형식의 75가 담긴 CSV는 최신 편집기에서 다시 내보내야 합니다.',context:row.source+' · '+row.note+'\n표식 조준 + 필살기 활성 → spread → ConfigureGrowth → 무기 탄퍼짐 계산. 숫자 토큰은 소수점부터 교체합니다.'};
    const source=row.source||'',note=row.note||'',key=(row.field||'').split('.').pop().replace(/\[.*?\]/g,'').toLowerCase();
    const target=/\.(json|asset)$/.test(source)?row.entity:domain(row,dataset);
    if(/이전 필드|현 데이터 형식에 없는/.test(row.scope||''))return {title:row.label,stat:'이전 데이터 · 보존 참고',target,role:'현재 형식에서 미사용',certainty:'적용 제외 확인',summary:'현재 데이터 형식에 선언되지 않은 이전 필드입니다.',effect:'이 숫자를 바꿔도 현재 게임 수치에 적용된다고 볼 수 없습니다.',caution:'현재 유효한 설정 필드를 먼저 확인하세요.',context:row.scope};
    if(/비활성/.test(row.scope||''))return {title:row.label,stat:'현재 비활성 규칙',target,role:'비활성',certainty:'적용 제외 확인',summary:'현재 맵 구성에서 사용하지 않는 문턱 또는 규칙입니다.',effect:'이 값만 바꿔서는 새 진입점이나 비활성 기능이 켜지지 않습니다.',caution:note,context:row.scope};
    const codeEvidence=window.ExtractionCodeEvidence?.get(row);
    if(codeEvidence)return codeEvidence;
    const reference=row.editable===false;
    const scoped=scopedFields.find(([rx,k])=>rx.test(source)&&(k===key||k===(row.field||'').toLowerCase()));
    const def=scoped?{title:scoped[2],stat:scoped[3],summary:scoped[4],effect:scoped[5]}:fields[key];
    let role=/\.json$/.test(source)?'카탈로그 설정':/\.asset$/.test(source)?'직렬화 설정':/\b(?:public|private|const|readonly)\b.*\s=/.test(note)?'코드 초기값':/Math\.(?:Min|Max|Clamp)|Mathf\.(?:Min|Max|Clamp)/.test(note)?'경계·계산값':/\bif\s*\(|[<>]=/.test(note)?'조건·판정값':'코드 상수';
    if(reference)role='참조 정보';
    const caution=/\.cs$/.test(source)?'코드의 이 위치에 있는 값입니다. 설정 에셋·개별 프리팹·실행 상태가 우선하거나 값을 다시 계산할 수 있습니다.':'설정에 저장된 기준입니다. 개별 재정의와 기존 세이브·이미 생성된 상태에는 별도 값이 있을 수 있습니다.';
    // Field names alone cannot establish the role of arbitrary literals in a C# expression.
    const direct=def&&(/\.(json|asset)$/.test(source)||role==='코드 초기값');
    if(direct)return {...def,target,role,certainty:'필드 설명',context:row.scope,caution};
    if(reference)return {title:row.label,stat:/배치|형상/.test(row.scope||'')?'배치·형상 참조':'식별·연결 정보',target,role,certainty:'참조 정보',summary:'데이터나 배치 대상을 연결하는 조회용 항목입니다.',effect:'수치 튜닝용 설정과 구별해 확인하세요. 현재 편집 권한과 별개로 원본이 참조 항목으로 지정되어 있습니다.',context:row.scope,caution};
    return {title:row.label,stat:domain(row,dataset),target,role,certainty:'세부 영향 확인 필요',summary:'이 원본의 기능과 연결된 값입니다. 현재 설명만으로 영향을 받는 개별 스탯을 확정할 수 없습니다.',effect:'원본 코드의 조건·계산식과 연관 설정을 확인한 뒤 조정하세요. 같은 이름의 다른 행도 역할이 다를 수 있습니다.',context:row.scope,caution};
  }
  window.ExtractionImpactGuide={describe};
})();
