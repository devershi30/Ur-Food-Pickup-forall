package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Menu.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder


@Entity
public class MenuFood {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID uid;

    @JsonIgnore
    @ManyToOne
    private Menu menu;

    private String name;

    private String description;

    private double price;

    private String category;

    private boolean available;

    private ZonedDateTime createdOn;

}
