import com.litevar.ihub.AgentIhubServerApplication;
import com.litevar.ihub.agent.LiteAgentServiceClient;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 *
 * @author Teoan
 * @since 2025/8/27 09:25
 */
@SpringBootTest(classes = AgentIhubServerApplication.class)
@Slf4j
public class AgentIhubServerApplicationTest {

    @Resource
    private LiteAgentServiceClient liteAgentServiceClient;


    @Test
    void testLiteAgentChat()  {
//        log.info("请求返回: {}", liteAgentServerClient.getLiteAgentToken());
    }


}

