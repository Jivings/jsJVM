public class Inheritence {

  public static void main(String... args) {
    System.out.println((new Foo()).getText());
  }

  private static class Foo extends Bar {
        
    public String getText() {
      return "Subclass Text";
    }
  }
  
  private static class Bar {
    public String getText() {
      return "Super text";
    }
  }
    
}
