import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class TestDB {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require";
        String user = "postgres.qylfgrbuzmqhozioftkn";
        String password = "vAge7tOzaxU7qBbN";

        try {
            Connection conn = DriverManager.getConnection(url, user, password);
            System.out.println("Connected successfully!");
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT count(*) FROM items");
            while(rs.next()) {
                System.out.println("Items count: " + rs.getInt(1));
            }
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
