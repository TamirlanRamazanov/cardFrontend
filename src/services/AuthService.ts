import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  UserCredential,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

class AuthService {
  private state: AuthState;
  private static instance: AuthService;

  private constructor() {
    this.state = {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null
    };

    // Слушаем изменение состояния аутентификации
    onAuthStateChanged(auth, async (firebaseUser) => {
      this.state.isLoading = true;
      
      if (firebaseUser) {
        try {
          // Получаем дополнительную информацию о пользователе из Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            this.state.user = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: userData.name || 'User'
            };
            this.state.isAuthenticated = true;
          } else {
            // Если документа нет, создаем базовую информацию
            this.state.user = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: 'User'
            };
            this.state.isAuthenticated = true;
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          this.state.error = 'Error fetching user data';
        }
      } else {
        this.state.user = null;
        this.state.isAuthenticated = false;
      }
      
      this.state.isLoading = false;
    });
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Вход в аккаунт через Firebase
   */
  public async login(email: string, password: string): Promise<User | null> {
    this.state.isLoading = true;
    this.state.error = null;

    try {
      // Вход через Firebase
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth, 
        email, 
        password
      );
      
      const firebaseUser = userCredential.user;
      
      // Получаем дополнительную информацию из Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const user = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: userData.name || 'User'
        };
        
        this.state.user = user;
        this.state.isAuthenticated = true;
        
        return user;
      } else {
        // Если документа нет, возвращаем базовую информацию
        const user = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: 'User'
        };
        
        this.state.user = user;
        this.state.isAuthenticated = true;
        
        return user;
      }
    } catch (error: any) {
      this.state.error = this.mapFirebaseError(error.code);
      return null;
    } finally {
      this.state.isLoading = false;
    }
  }

  /**
   * Регистрация через Firebase
   */
  public async register(name: string, email: string, password: string): Promise<User | null> {
    this.state.isLoading = true;
    this.state.error = null;

    try {
      // Регистрация через Firebase
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      const firebaseUser = userCredential.user;
      
      // Создаем документ пользователя в Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        name: name,
        email: email,
        createdAt: new Date()
      });
      
      const user = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: name
      };
      
      this.state.user = user;
      this.state.isAuthenticated = true;
      
      return user;
    } catch (error: any) {
      this.state.error = this.mapFirebaseError(error.code);
      return null;
    } finally {
      this.state.isLoading = false;
    }
  }

  /**
   * Выход из аккаунта
   */
  public async logout(): Promise<void> {
    try {
      await signOut(auth);
      this.state.user = null;
      this.state.isAuthenticated = false;
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  /**
   * Получить текущего пользователя
   */
  public getCurrentUser(): User | null {
    return this.state.user;
  }

  /**
   * Проверить аутентификацию
   */
  public isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  /**
   * Получить статус загрузки
   */
  public isLoading(): boolean {
    return this.state.isLoading;
  }

  /**
   * Получить ошибку
   */
  public getError(): string | null {
    return this.state.error;
  }

  /**
   * Маппинг ошибок Firebase
   */
  private mapFirebaseError(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Этот email уже используется. Пожалуйста, выберите другой.';
      case 'auth/invalid-email':
        return 'Неверный формат email.';
      case 'auth/weak-password':
        return 'Пароль слишком простой. Используйте минимум 6 символов.';
      case 'auth/user-not-found':
        return 'Пользователь с таким email не найден.';
      case 'auth/wrong-password':
        return 'Неверный пароль.';
      case 'auth/too-many-requests':
        return 'Слишком много попыток. Пожалуйста, попробуйте позже.';
      default:
        return 'Произошла ошибка. Пожалуйста, попробуйте позже.';
    }
  }
}

export const authService = AuthService.getInstance();
export type { User }; 