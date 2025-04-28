export const fieldMapping: Record<string, string> = {
    'Гемоглобин': 'hemoglobin',
    'Глюкоза': 'glucose',
    'Холестерин': 'cholesterol',
  
    'Белок': 'protein',
    'Лейкоциты': 'leukocytes',
    'Эритроциты': 'erythrocytes',
  
    'Рост': 'height',
    'Вес': 'weight',
    'Обхват талии': 'waist_circumference',
    'Обхват бедер': 'hip_circumference',
    'ИМТ': 'imt',
    'АКМ': 'akm',
    'ДАКМ': 'dakm',
    'ЖМ': 'jkm',
    'ДЖМ': 'djkm',
    'СКМ': 'skm',
    'ДСКМ': 'dskm',
    'ОО': 'oo',
    'ОЖ': 'ozh',
    'ВЖ': 'vzh',
    'ФУ': 'fu',
  
    'АДс': 'ads',
    'АДд': 'add',
  
    'ЧСС': 'chss',
    'RMSSD': 'rmssd',
    'CV': 'cv',
    'TP': 'tp',
    'HF': 'hf',
    'LF': 'lf',
    'VLF': 'vlf',
    'СФ': 'sf',
    'SI': 'si',
    'Тип вегетативной регуляции': 'vegetative_regulation',
  
    'КЧССМ': 'kchs',
    'Максимальная частота движений': 'max_movement_frequency',
  
    'Кистевая динамометрия (сила)': 'hand_dynamometry_strength',
    'Кистевая динамометрия (выносливость)': 'hand_dynamometry_endurance',
    'Высота прыжка из приседа (SJ)': 'sj_jump_height',
    'Высота прыжка вверх без взмаха руками (CMJ)': 'jump_height_no_hands',
    'Высота прыжка вверх со взмахом руками': 'jump_height_with_hands',
    'CMJ/SJ': 'cmj_sj_ratio',
    'Мощность прыжка': 'jump_power',
  
    'Проба Ромберга': 'romberg_test',
    'S (о)': 's_o',
    'V (о)': 'v_o',
    'S (з)': 's_z',
    'V (з)': 'v_z',
    'P (о)': 'p_o',
    'P3': 'p_z',
    'Кэ': 'ke',
    'Динамическая проба': 'dynamic_test',
    'Стресс-проба': 'stress_test',
  
    'ПЗМР': 'pzmr',
    'СДР': 'sdr',
    'РДО': 'rdo',
  
    'ЧСС покоя': 'chss_resting',
    'Скорость восстановления ЧСС': 'chss_recovery_speed',
    'Приковая ЧСС': 'chss_peak',
    'Показатели ВСР': 'vsr_indicators',
  
    'Общий объём работы': 'total_work_volume',
    'Пиковое ЧСС': 'peak_chss',
    'ЧССАэП': 'chss_aep',
    'ЧССАнП': 'chss_anp',
    'VO2': 'vo2',
    'VO2max': 'vo2_max',
    'VO2АэП': 'vo2_aep',
    'VO2АнП': 'vo2_anp',
    'Мощность/скорость АэП': 'power_speed_aep',
    'Мощность/скорость АнП': 'power_speed_anp',
    'La': 'la',
    'ЛВ': 'lv',
    'ДК': 'dk',
  
    'ЧСС (ортостатическая проба)': 'chss',
    'ЧСС (контрольные поединки)': 'chss',
  
    'Назначен на дату': 'analyze_date',
    'Имя': 'first_name',
    'Фамилия': 'last_name',
    'Отчество': 'middle_name',
    'Спорт': 'sport_name',
    'Команда': 'team_name',
  };

export const validTables = new Set([
    'anthropometry_bioimpedance',
    'blood_clinical_analysis',
    'urine_clinical_analysis',
    'tonometry',
    'rhythmocardiography',
    'frequencymetry',
    'speed_strength_qualities',
    'chronoreflectometry',
    'stabilometry',
    'squat_test',
    'ergometric_tests',
    'orthostatic_test',
    'special_functional_tests',
  ]);

export function getTargetTable(analyzeName: string): string | null {
    const tableMap: Record<string, string> = {
      'Антропометрия и биоимпедансометрия': 'anthropometry_bioimpedance',
      'Клинический анализ крови': 'blood_clinical_analysis',
      'Клинический анализ мочи': 'urine_clinical_analysis',
      'Тонометрия': 'tonometry',
      'Ритмокардиография': 'rhythmocardiography',
      'Частометрия': 'frequencymetry',
      'Скоростно-силовые и силовые качества': 'speed_strength_qualities',
      'Хронорефлексометрия': 'chronoreflectometry',
      'Стабилометрия': 'stabilometry',
      'Проба с приседаниями': 'squat_test',
      'Эргометрические тесты': 'ergometric_tests',
      'Ортостатическая проба': 'orthostatic_test',
      'Специальные функциональные пробы': 'special_functional_tests',
    };
  
    return tableMap[analyzeName] || null;
}

export const translateFields = (rows: any[], fieldMapping: Record<string, string>): any[] => {
    return rows.map((row) => {
      const translatedRow: Record<string, any> = {};
      for (const key in row) {
        const translatedKey = fieldMapping[key] || key;
        translatedRow[translatedKey] = row[key];
      }
      return translatedRow;
    });
  };
  