package com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Menu.entity;


import com.UrFoodDelivery.UrFoodDelivery.Backend.BusinessLogic.Vendor.entities.Vendor;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder


@Entity
public class Menu {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID uid;

    private String title;

    @ManyToOne
    private Vendor vendor;

    @OneToMany(mappedBy = "menu",cascade=CascadeType.ALL)
    private List<MenuFood> menuFoodList;

    private ZonedDateTime createdOn;




}
