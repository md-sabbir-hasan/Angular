package com.erp.EnterpriseSystem.service;


import com.erp.EnterpriseSystem.entity.PoliceStation;
import com.erp.EnterpriseSystem.repository.PoliceStationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PoliceStationService {

    @Autowired
    private PoliceStationRepository stationRepository;

    public List<PoliceStation> getAll(){
        return stationRepository.findAll();

    }

    public void saveOrUpdate(PoliceStation p){
        stationRepository.save(p);
    }

    public Optional<PoliceStation> getById(long id){
        return stationRepository.findById(id);
    }

    public  void  delete(long id){
        stationRepository.deleteById(id);
    }
}
