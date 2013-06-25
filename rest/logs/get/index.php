<?php

$this->values['identifier'];
$this->values['q'];
$this->values['limit'];
$this->values['page'];
$this->values['scope'];
$this->values['order'];
$this->values['order_dir'];
$this->values['fields'];


$this->fields = array(
    'id' => array('int','l.id'),
    'feature_type' => array("int",'l.feature_type'),
    'feature_id' => array("int",'l.feature_id'),
    'c_date' => array("int",'l.c_date'),
    'c_user_id' => array("int",'l.c_user_id'),
    'priority' => array("int",'l.priority'),
    'label' => array("string",'l.label'),
    'message' => array("string",'l.message'),
    'file' => array("string",'l.file'),
    'line' => array("string",'l.line'),

);

if (isset($this->values['scope']['expiring'])) {
    $expire_date = ZU_NOW + 2592000;
    if (isset($_SESSION['ZUIZZ']['USER']['expire_date'])) {
        $expire_date = $_SESSION['ZUIZZ']['USER']['expire_date'];
    }
    $this->values['scope']['expires'] = array('lt', $expire_date);

}

/*
 * Weiche für cases
 *
 * bei q suche aufrufen
 * bei identifier identifier.php
 * wenn q und identifier fehlen, liste zurückgeben
 *
 */

if ($this->values['identifier'] != NULL) {
    include("identifier.php");
} elseif ($this->values['q'] != NULL) {
    include("search.php");
} elseif ($this->values['identifier'] == NULL && $this->values['q'] == NULL) {
    include("list.php");
}

function format_dates($Machines_array)
{
    foreach ($Machines_array as $k => $M) {
        $Machines_array[$k]['id'] = (int)$M['id'];

        if (isset($M['last_power_off'])) {
            $Machines_array[$k]['last_power_off'] = date('d.m.y', $M['last_power_off']);
        }
        if (isset($M['last_power_on'])) {
            $Machines_array[$k]['last_power_on'] = date('d.m.y', $M['last_power_on']);
        }
        if (isset($M['expires'])) {
            $Machines_array[$k]['expires'] = date('d.m.y', $M['expires']);
            $Machines_array[$k]['expires_in_days'] = (int)(($M['expires'] - ZU_NOW) / 86400);
        }
    }
    return $Machines_array;
}