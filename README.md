# Менеджер Закупок

Веб-додаток для управління закупками, розроблений на React та Firebase.

## Функціональність

- Аутентифікація користувачів
- Управління товарами та їх цінами в різних магазинах
- Створення та відстеження списків закупок
- Управління потребами в закупці з різними статусами
- Імпорт/експорт даних через Excel
- Публічна форма для запитів на закупку

## Технології

- React
- Firebase (Auth, Firestore, Hosting)
- Tailwind CSS
- TypeScript (для Firebase Functions)

## Встановлення

1. Клонуйте репозиторій:
```bash
git clone [URL репозиторію]
cd my-purchase-app-prod
```

2. Встановіть залежності:
```bash
npm install
cd functions && npm install && cd ..
```

3. Запустіть проект локально:
```bash
npm start
```

## Деплой

Проект налаштований для автоматичного розгортання на Firebase Hosting:

```bash
npm run build
firebase deploy
```

## Структура проекту

```
src/
  ├── components/     # React компоненти
  │   ├── auth/      # Компоненти аутентифікації
  │   ├── modals/    # Модальні вікна
  │   ├── pages/     # Сторінки додатку
  │   └── shared/    # Спільні компоненти
  ├── config/        # Конфігурація Firebase
  ├── hooks/         # React хуки
  └── utils/         # Утиліти

functions/           # Firebase Functions
```

## Ліцензія

MIT