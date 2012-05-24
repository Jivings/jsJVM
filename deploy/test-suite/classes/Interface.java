public class Interface {

  public static void main(String... args) {
    Foo f = new Foo() {
      public void doSomething() {
        System.out.println("Hello");
      }
    };
    f.doSomething();
  }
  
  private interface Foo {
    
    public void doSomething();
  }

}

