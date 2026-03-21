import { io, Socket } from "socket.io-client"

const API_BASE_URL = import.meta.env.VITE_PUBLIC_SOCKET_URL

class SocketManager {
  private static instance: SocketManager
  private socket: Socket | null = null

  /**
   * Единственный экземпляр менеджера (singleton).
   */
  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager()
    }

    return SocketManager.instance
  }

  /**
   * Создаёт клиент или возвращает уже открытое соединение.
   *
   * @returns Экземпляр `Socket` для текущего подключения.
   */
  connect(): Socket {
    if (this.socket) {
      return this.socket
    }

    const socket = io(`${API_BASE_URL}`, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      withCredentials: true,
      transports: ["websocket", "polling"],
    })

    socket.on("connect", () => {
      console.log("Socket connected")
    })

    socket.on("connect_error", (err) => {
      console.error("WS connect_error:", err?.message || err)
    })

    socket.on("error", (err) => {
      console.error("WS error:", err)
    })

    socket.on("disconnect", () => {
      console.warn("Socket disconnected")
    })

    this.socket = socket
    return socket
  }

  /**
   * Снимает все слушатели, отключается от сервера и сбрасывает внутреннюю ссылку на сокет.
   */
  disconnect(): void {
    if (!this.socket) return

    this.socket.removeAllListeners()
    this.socket.disconnect()
    this.socket = null
  }

  /**
   * Подписка на серверное событие по имени.
   *
   * @template T — тип полезной нагрузки события.
   * @param event — имя события Socket.IO.
   * @param callback — обработчик данных события.
   * @returns Функция отписки (`off` для того же обработчика). Если сокета ещё нет, возвращает no-op.
   */
  subscribe<T>(event: string, callback: (data: T) => void): VoidFunction {
    const socket = this.socket
    if (!socket) {
      return () => {}
    }

    socket.on(event, callback)

    return () => {
      socket.off(event, callback)
    }
  }

  /**
   * Запрос на вход в комнату: отправляет событие `join:room` с переданными данными.
   *
   * @template T — тип тела запроса (идентификатор комнаты и т.п.).
   * @param data — данные для сервера.
   */
  joinRoom<T>(data: T): void {
    this.socket?.emit("join:room", data)
  }

  /**
   * Отправка произвольного события на сервер.
   *
   * @template T — тип отправляемых данных.
   * @param event — имя события.
   * @param data — полезная нагрузка.
   */
  emit<T>(event: string, data: T): void {
    this.socket?.emit(event, data)
  }

  /**
   * Проверяет, установлено ли TCP/WebSocket-соединение у текущего клиента.
   *
   * @returns `true`, если сокет существует и `connected`; иначе `false`.
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false
  }
}

/** Готовый singleton для импорта в приложении. */
export const socketManager = SocketManager.getInstance()
