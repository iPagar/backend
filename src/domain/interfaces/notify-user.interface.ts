export default interface INotifyUserUseCase {
  notifyMarksChanges(): Promise<void>;
}
