package com.litevar.ihub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
//@ComponentScan(basePackages = {"com.litevar.ihub.*"})
public class AgentIhubServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(AgentIhubServerApplication.class, args);
    }

}
