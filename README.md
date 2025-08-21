# WebLarek — фронтенд проекта

## Используемый стек

* TypeScript, HTML, SCSS
* Webpack 5, webpack-dev-server
* ESLint, Prettier
* Архитектурный паттерн: MVP (Model–View–Presenter)
* Событийная модель: собственный `EventEmitter`

## Сборка и запуск

1. Node.js ≥ 20, `npm i`
2. Команды:

* Локальный сервер разработки: `npm start`
* Dev‑сборка: `npm run build:dev`
* Продакшн‑сборка: `npm run build` или `npm run build:prod`
* Наблюдение: `npm run watch`
* Линтинг: `npm run lint` / `npm run lint:fix`
* Форматирование: `npm run format`
* Деплой на GitHub Pages: `npm run deploy`

## Данные и интерфейсы (только для объектов)

В документации интерфейсы приводятся **без** `export`.

```ts
interface IProduct {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryType: 'soft' | 'other' | 'additional' | 'button' | 'hard';
  price: number | string;
  disabled?: boolean;
  image: string;
}

interface ICartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
}

type ICartItemInput = Omit<ICartItem, 'quantity'>;

interface IUserData {
  address: string;
  email: string;
  phone: string;
  payment: 'online' | 'cash';
}

interface IApiProductResponse {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  image: string;
}

interface ApiListResponse<T> { total: number; items: T[] }
```

## Архитектура

Проект разделён на три слоя.

### Слой Модель (Model)

* **CatalogModel**: хранит массив товаров и выдаёт товар по `id`.

  * Поля: `products: IProduct[]`.
  * Методы: `setProducts(products)`, `getProductById(id)`.

* **CartModel** хранит содержимое корзины, сумму и состояние «в корзине».

  * Поля: `items: ICartItem[]` (приватно).
  * Методы: `getItems()`, `getTotal()`, `inCart(id)`, `add(item)`, `remove(id)`, `clear()`.
  * События: `change` — любое изменение корзины.

* **UserModel**: валидация данных заказа.

  * Методы: `validateOrder({ address, payment }) → { ok, addressOk, paymentOk, ... }`, `validateContacts({ email, phone }) → { valid, errors }.`

### Слой Представления (View)

* **ModalView**: универсальная модалка (один класс).

  * Методы: `setContent(node)`, `open()`, `close()`, `isOpen(): boolean`.

* **HeaderView**: шапка и счётчик корзины.

  * Методы: `setCartCount(count)`; клик по корзине эмитит `cart:open`.

* **CatalogView**: контейнер каталога.

  * Методы: `addCard(card)`, `clear()`.

* **ProductCardView** *(расширяет EventEmitter)*: карточка товара в каталоге.

  * События: `click` (по карточке), `buy` (по кнопке «Купить»). Состояния: «Недоступно»/«Купить»/«В корзине».

* **CardPreviewView**: полноэкранное превью товара (в модалке) с кнопкой «В корзину/Удалить из корзины».

  * Методы: `render()`; внутри обращается к `CartModel` и эмитит `cart:updated:quiet`.

* **CartView**: рендер корзины (список позиций, сумма, кнопка «Оформить»).

  * Методы: `render(items, total) → HTMLElement`.
  * Действия: клик по корзине → `cart:delete { id }`; клик «Оформить» → `cart:order`.

* **OrderView**: шаг 1 оформления — адрес и способ оплаты.

  * Методы: `render()`, `getOrderData()`, `setPayment(value)`, `setNextDisabled(bool)`, `applyValidation(result)`.

* **ContactView**: шаг 2 — контакты.

  * Методы: `render()`, `getData()`, `onEmailInput(cb)`, `onPhoneInput(cb)`, `onSubmit(cb)`, `setSubmitDisabled(bool)`, `setErrors(text)`.

**SuccessView**: экран успешного заказа.

  * Методы: `render(title, text)`, `onClose(cb)` (диспетчит DOM‑событие `success:close`).

(В проекте также присутствуют вспомогательные `CardCatalogView`, `CardBasketView` — альтернативные или вспомогательные реализации рендеринга карточек/списка.)

### Слой Презентера (Presenter)

**ProductPresenter**: связывает `CatalogModel`, `CartModel`, `CatalogView` и `ModalView`.

  * Поведение: создаёт `ProductCardView` на каждый товар; на `card.click` — открывает `CardPreviewView` в модалке; на `card.buy` — добавляет товар в корзину и эмитит `cart:updated:quiet`/`cart:changed`.

 **CartPresenter**: управляет корзиной и переходом к оформлению.

  * Слушает: `cart:open` → рендер корзины в модалке; `cart:delete { id }` → удаление; `cart:order` → показ `OrderView` и запуск `UserFormPresenter`; `cart:clear` → сброс.
  * Поддерживает `cart:count` (для шапки) и «горячее» обновление содержимого при открытой модалке.

* **UserFormPresenter**: оркестрирует шаги оформления с валидацией через `UserModel`.

  * Шаг 1: собирает данные из `OrderView`, валидирует `UserModel.validateOrder`, включает/выключает кнопку «Далее».
  * Шаг 2: создаёт `ContactView`, валидирует `UserModel.validateContacts`, включает/выключает кнопку «Оплатить/Завершить», выводит ошибки.
  * Успех: показывает `SuccessView`, эмитит `cart:clear` и `ui:scrollTop`, закрывает модалку.

### Базовые сервисы

* **EventEmitter**: `on`, `off`, `offAll`, `emit`, `trigger` — установка/снятие слушателей и генерация событий.
* **Api**: клиент для бекенда (загрузка продуктов, маппинг к `IProduct`), `getProducts()`; маппер `IApiProductResponse → IProduct` (категория → `categoryType`). Базовые URL — из `utils/constants.ts` (`API_URL`, `CDN_URL`).

## События

Глобальные события шины:

* `cart:open` — открыть модальное окно корзины
* `cart:delete { id }` — удалить позицию из корзины
* `cart:order` — перейти к оформлению заказа (OrderView → ContactView)
* `cart:clear` — пустая корзина (после успеха)
* `cart:count { count }` — обновить счётчик в шапке
* `cart:updated:quiet { count, total }` — обновление счётчика/суммы
* `cart:changed` — общее событие изменения корзины
* `ui:scrollTop` — плавный скролл страницы наверх
* `change` — эмитит `CartModel` при изменении списка

Локальные события компонентов:

* `ProductCardView`: `click`, `buy`
* `SuccessView`: DOM‑событие `success:close` на корневом элементе

## Пример сценария (по шагам)

Ситуация: покупка из превью товара.

1. **View**: `ProductCardView` по клику эмитит `click` → `ProductPresenter` открывает `CardPreviewView` в `ModalView`.
2. **View → Presenter**: в превью нажата кнопка «В корзину». `CardPreviewView` вызывает методы `CartModel.add(...)`.
3. **Model**: `CartModel` обновляет `items` и эмитит `change`. `CardPreviewView` также эмитит `cart:updated:quiet { count, total }` для мгновенного счётчика.
4. **Presenter**: `CartPresenter`/`index.ts` ловят `cart:updated:quiet` и `cart:count` → `HeaderView.setCartCount(count)`.
5. **View**: `CardPreviewView` меняет надпись кнопки на «Удалить из корзины». Пользователь может открыть корзину — `CartView` отрисует актуальные позиции и сумму.

## Связи компонентов

* Каталог: `CatalogModel` ↔ `ProductPresenter` ↔ `CatalogView`/`ProductCardView`/`CardPreviewView`
* Корзина: `CartModel` ↔ `CartPresenter` ↔ `CartView`/`HeaderView`/`ModalView`
* Оформление: `UserModel` ↔ `UserFormPresenter` ↔ `OrderView` → `ContactView` → `SuccessView`

