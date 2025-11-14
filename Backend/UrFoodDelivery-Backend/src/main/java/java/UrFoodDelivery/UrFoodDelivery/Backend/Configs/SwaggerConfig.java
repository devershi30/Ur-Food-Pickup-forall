package com.UrFoodDelivery.UrFoodDelivery.Backend.Configs;


import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;


@Configuration
public class SwaggerConfig {


    @Value("${server.address}")
    private String serverAddr;

    @Value("${server.port}")
    private String serverPort;


    @Bean
    public OpenAPI myOpenAPI()
    {

        List<Server> servers=getServers();

//        Server localserver=new Server();
//        localserver.setUrl("http://"+serverAddr+":"+serverPort);

//        Predicate<String> i = PathSelectors.any();
//        for(String j:i)
//            servers.add(new Server(j));
//





        Info info=new Info();

        info.setTitle("Ur Food delivery App");
        info.setDescription("Ur Food delivery  App");

        Contact pato=new Contact()
                .name("")
                        .email("admin@gmail.com")
                                .url("https://UrFooddelivery.com");

        info.setContact(pato);





        return new OpenAPI().info(info).servers(servers);
    }


    private List<Server> getServers() {
        List<Server> servers = new ArrayList<>();
        servers.add(new Server().url("http://localhost:"+serverPort));

        try {
            Enumeration<NetworkInterface> networkInterfaces = NetworkInterface.getNetworkInterfaces();
            while (networkInterfaces.hasMoreElements()) {
                NetworkInterface networkInterface = networkInterfaces.nextElement();
                Enumeration<InetAddress> addresses = networkInterface.getInetAddresses();
                while (addresses.hasMoreElements()) {
                    InetAddress address = addresses.nextElement();
                    if (!address.isLoopbackAddress() && !address.isLinkLocalAddress() && !address.isMulticastAddress()) {
                        // Assuming your application runs on port 8080, adjust as needed
                        servers.add(new Server().url("http://" + address.getHostAddress() + ":"+serverPort));
                    }
                }
            }
        } catch (SocketException e) {
            e.printStackTrace();
        }

        return servers;
    }


}
