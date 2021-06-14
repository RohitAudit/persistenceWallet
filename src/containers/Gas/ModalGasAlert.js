import {
    Modal,
    Form
} from 'react-bootstrap';
import React, {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import config from "../../config";
import transactions from "../../utils/transactions";
import {connect} from "react-redux";
import Icon from "../../components/Icon";
import ModalDecryptKeyStore from "../KeyStore/ModalDecryptKeystore";

const ModalGasAlert = (props) => {
    const {t} = useTranslation();
    const [showGasField, setShowGasField] = useState(false);
    const [gasValidationError, setGasValidationError] = useState(false);
    const [activeFeeState, setActiveFeeState] = useState("Average");
    const [checkAmountError, setCheckAmountError] = useState(false);
    const [showDecryptModal, setShowDecryptModal] = useState(false);
    const [gas, setGas] = useState(config.gas);
    const [fee, setFee] = useState(config.averageFee);

    useEffect(() => {
        if(props.formData.formName === "withdrawMultiple" || props.formData.formName === "withdrawAddress" || props.formData.formName === "withdrawValidatorRewards"){
            if(props.transferableAmount < transactions.XprtConversion(gas * fee)){
                setCheckAmountError(true);
            }else {
                setCheckAmountError(false);
            }
        } else {
            if((props.transferableAmount - (props.formData.amount*1)) < transactions.XprtConversion(gas * fee)){
                setCheckAmountError(true);
            }else {
                setCheckAmountError(false);
            }
        }


        setFee(gas * fee);
    }, []);

    const amountTxns = (
        props.formData.formName === "withdrawMultiple" || props.formData.formName === "withdrawAddress" || props.formData.formName === "withdrawValidatorRewards"
    );
    const handleGas = () => {
        setShowGasField(!showGasField);
    };

    const handleGasChange = (event) => {
        if((event.target.value * 1) >= 80000 && (event.target.value * 1) <= 2000000){
            setGasValidationError(false);
            setGas(event.target.value * 1);
            if((localStorage.getItem("fee") * 1) !== 0) {
                if (activeFeeState === "Average") {
                    setFee((event.target.value * 1) * config.averageFee);
                } else if (activeFeeState === "High") {
                    setFee((event.target.value * 1) * config.highFee);
                } else if (activeFeeState === "Low") {
                    setFee((event.target.value * 1) * config.lowFee);
                }
                if(amountTxns){
                    if (activeFeeState === "Average" && (transactions.XprtConversion((event.target.value * 1) * config.averageFee)) > props.transferableAmount) {
                        setCheckAmountError(true);
                    } else if (activeFeeState === "High" && (transactions.XprtConversion((event.target.value * 1) * config.highFee)) > props.transferableAmount) {
                        setCheckAmountError(true);
                    } else if (activeFeeState === "Low" && (transactions.XprtConversion((event.target.value * 1) * config.lowFee)) > props.transferableAmount) {
                        setCheckAmountError(true);
                    } else {
                        setCheckAmountError(false);
                    }
                }else {
                    if (activeFeeState === "Average" && (transactions.XprtConversion((event.target.value * 1) * config.averageFee)) + props.formData.amount > props.transferableAmount) {
                        setCheckAmountError(true);
                    } else if (activeFeeState === "High" && (transactions.XprtConversion((event.target.value * 1) * config.highFee)) + props.formData.amount > props.transferableAmount) {
                        setCheckAmountError(true);
                    } else if (activeFeeState === "Low" && (transactions.XprtConversion((event.target.value * 1) * config.lowFee)) + props.formData.amount > props.transferableAmount) {
                        setCheckAmountError(true);
                    } else {
                        setCheckAmountError(false);
                    }
                }

            }
        }else {
            setGasValidationError(true);
        }


    };

    const handleFee = (feeType, feeValue) => {
        setActiveFeeState(feeType);
        setFee(gas * feeValue);
        if(amountTxns){
            if (props.transferableAmount  < transactions.XprtConversion(gas * feeValue)) {
                setCheckAmountError(true);
            }else {
                setCheckAmountError(false);
            }
        }else {
            if ((props.transferableAmount - (props.formData.amount*1)) < transactions.XprtConversion(gas * feeValue)) {
                setCheckAmountError(true);
            }else {
                setCheckAmountError(false);
            }
        }

    };

    const handleNext = () =>{
        if(props.formData.formName === "delegate") {
            setShowDecryptModal(true);
        }
        else {
            setShowDecryptModal(true);
        }
    };

    const handlePrevious = () => {
        if(props.formData.formName === "delegate"){
            props.setFeeModal(false);
            props.setInitialModal(true);
            setCheckAmountError(false);
            setGas(config.gas);
            setFee(config.averageFee);
        }

        else if(props.formData.formName === "send" || props.formData.formName === "ibc"){
            props.handleClose();
        }
        else {
            props.setFeeModal(false);
            props.setInitialModal(true);
        }
    };
    return (
        <>
            {!showDecryptModal ?
                <>
                    <Modal.Header className="result-header success" closeButton>
                        <div className="previous-section txn-header">
                            <button className="button" onClick={() => handlePrevious()}>
                                <Icon
                                    viewClass="arrow-right"
                                    icon="left-arrow"/>
                            </button>
                        </div>
                        <h3 className="heading">{props.formData.modalHeader}</h3>
                    </Modal.Header>
                    <Modal.Body className="create-wallet-body import-wallet-body">
                        <>
                            <p className="fee-title text-center">Fee</p>
                            <div className="fee-container">
                                <>
                                    {
                                        props.transferableAmount < config.averageFee ?
                                            <div className={activeFeeState === "Low" ? "fee-box active" : "fee-box"}
                                                onClick={() => handleFee("Low", config.lowFee)}>
                                                <p className="title">Zero</p>
                                                <p className="gas">{(transactions.XprtConversion(gas * config.lowFee) * props.tokenPrice).toLocaleString(undefined, {minimumFractionDigits: 4})} $</p>
                                                <p className="xprt">{(transactions.XprtConversion(gas * config.lowFee)).toLocaleString(undefined, {minimumFractionDigits: 4})} XPRT</p>
                                            </div>
                                            : null
                                    }
                                    <div className={activeFeeState === "Average" ? "fee-box active" : "fee-box"}
                                        onClick={() => handleFee("Average", config.averageFee)}>
                                        <p className="title">Low</p>
                                        <p className="gas">{(transactions.XprtConversion(gas * config.averageFee) * props.tokenPrice).toLocaleString(undefined, {minimumFractionDigits: 4})} $</p>
                                        <p className="xprt">{(transactions.XprtConversion(gas * config.averageFee)).toLocaleString(undefined, {minimumFractionDigits: 4})} XPRT</p>
                                    </div>
                                    <div className={activeFeeState === "High" ? "fee-box active" : "fee-box"}
                                        onClick={() => handleFee("High", config.highFee)}>
                                        <p className="title">High</p>
                                        <p className="gas">{(transactions.XprtConversion(gas * config.highFee) * props.tokenPrice).toLocaleString(undefined, {minimumFractionDigits: 4})} $</p>
                                        <p className="xprt">{(transactions.XprtConversion(gas * config.highFee)).toLocaleString(undefined, {minimumFractionDigits: 4})} XPRT</p>
                                    </div>
                                </>

                            </div>
                            <div className="form-field p-0">
                                <p className="label"></p>
                                <div className="amount-field">
                                    <p className={checkAmountError ? "show amount-error text-left" : "hide amount-error text-left"}>{t("AMOUNT_ERROR_MESSAGE")}</p>
                                </div>
                            </div>
                        </>
                        <div className="select-gas">
                            <p onClick={handleGas} className="text-center">{!showGasField ? "Advanced" : "Advanced"}
                                {!showGasField ?
                                    <Icon
                                        viewClass="arrow-right"
                                        icon="down-arrow"/>
                                    :
                                    <Icon
                                        viewClass="arrow-right"
                                        icon="up-arrow"/>}
                            </p>
                        </div>
                        {showGasField
                            ?
                            <div className="form-field">
                                <p className="label info">{t("GAS")}</p>
                                <div className="amount-field">
                                    <Form.Control
                                        type="number"
                                        min={80000}
                                        max={2000000}
                                        name="gas"
                                        placeholder={t("ENTER_GAS")}
                                        step="any"
                                        defaultValue={gas}
                                        onChange={handleGasChange}
                                        required={false}
                                    />
                                    {
                                        gasValidationError ?
                                            <span className="amount-error">
                                                {t("GAS_WARNING")}
                                            </span> : ""
                                    }
                                </div>
                            </div>
                            : ""
                        }
                        <div className="buttons">
                            <button className="button button-primary" disabled={gasValidationError}
                                onClick={() => handleNext()}>{t("NEXT")}</button>
                        </div>
                    </Modal.Body>
                </> :
                <ModalDecryptKeyStore
                    formData={props.formData}
                    fee={fee}
                    gas={gas}
                    handleClose={props.handleClose}
                />
            }
        </>
    );
};

const stateToProps = (state) => {
    return {
        balance: state.balance.amount,
        tokenPrice: state.tokenPrice.tokenPrice,
        transferableAmount: state.balance.transferableAmount,
    };
};

export default connect(stateToProps)(ModalGasAlert);
