public class FloatTest {
    public static void main(String... args) {
        BenchmarkAtom test;
        test = new FloatAtom();
        
        test.initialize(1000);
        System.out.println(test.execute());
        test.cleanUp();

    }
}
