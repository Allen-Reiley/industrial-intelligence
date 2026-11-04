"use client";

import React, { useState } from "react";
import { useModal } from "@/hooks/useModal";
import { PencilIcon } from "@/icons";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";

export default function UserAddressCard() {
  const { isOpen, openModal, closeModal } = useModal();

  const [country, setCountry] = useState("South Africa");
  const [region, setRegion] = useState("Johannesburg, Gauteng");
  const [currency, setCurrency] = useState("ZAR (South African Rand)");
  const [taxId, setTaxId] = useState("ZA-4920194812");

  const [editCountry, setEditCountry] = useState(country);
  const [editRegion, setEditRegion] = useState(region);
  const [editCurrency, setEditCurrency] = useState(currency);
  const [editTaxId, setEditTaxId] = useState(taxId);

  const handleOpen = () => {
    setEditCountry(country);
    setEditRegion(region);
    setEditCurrency(currency);
    setEditTaxId(taxId);
    openModal();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setCountry(editCountry);
    setRegion(editRegion);
    setCurrency(editCurrency);
    setTaxId(editTaxId);
    closeModal();
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-6 sm:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <h4 className="mb-4 text-lg font-semibold text-gray-800 lg:mb-6 dark:text-white/90">
              Regional Operating Base & Tax Jurisdiction
            </h4>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                  Primary Market / Country
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {country}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                  Regional Operations Office
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {region}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                  Settlement Currency
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {currency}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                  Corporate VAT / Tax Reference
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {taxId}
                </p>
              </div>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleOpen}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 lg:inline-flex lg:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200 cursor-pointer"
            >
              <PencilIcon className="size-4" />
              Edit Base
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="m-4 max-w-[600px]">
        <div className="w-full rounded-2xl bg-white p-6 lg:p-8 dark:bg-gray-900">
          <h4 className="mb-1 text-xl font-bold text-gray-800 dark:text-white/90">
            Edit Regional Base
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Configure default billing jurisdiction and office dispatch location.
          </p>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="base-country">Country / Market</Label>
              <Input
                id="base-country"
                type="text"
                value={editCountry}
                onChange={(e) => setEditCountry(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="base-region">Regional Office</Label>
              <Input
                id="base-region"
                type="text"
                value={editRegion}
                onChange={(e) => setEditRegion(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="base-currency">Settlement Currency</Label>
              <Input
                id="base-currency"
                type="text"
                value={editCurrency}
                onChange={(e) => setEditCurrency(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="base-tax">VAT / Tax ID</Label>
              <Input
                id="base-tax"
                type="text"
                value={editTaxId}
                onChange={(e) => setEditTaxId(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button type="button" variant="outline" size="sm" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Preferences
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
