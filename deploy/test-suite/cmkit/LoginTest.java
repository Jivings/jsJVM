public class LoginTest {
    public static void main(String... args) {
        BenchmarkAtom test;
        test = new LogicAtom();
        test.initialize(1000);
        System.out.println(test.execute());
        test.cleanUp();
    }
}
