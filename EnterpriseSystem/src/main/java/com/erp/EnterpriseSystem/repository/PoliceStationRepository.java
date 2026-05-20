package com.erp.EnterpriseSystem.repository;

import com.erp.EnterpriseSystem.entity.PoliceStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PoliceStationRepository extends JpaRepository<PoliceStation, Long> {
}
